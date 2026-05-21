import crypto from "crypto";

// ======================================
// ENCRYPTION CONSTANTS
// ======================================

const AES_ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const TEXT_ENCODING = "utf8";
const STORAGE_ENCODING = "base64";

// ======================================
// KEY HELPERS
// ======================================

const toBase64 = (buffer) => buffer.toString(STORAGE_ENCODING);

const fromBase64 = (value, label) => {
    if (!value || typeof value !== "string") {
        throw new Error(`${label} is required`);
    }

    return Buffer.from(value, STORAGE_ENCODING);
};

const validateKey = (key, label) => {
    if (!Buffer.isBuffer(key) || key.length !== KEY_BYTES) {
        throw new Error(`${label} must be a ${KEY_BYTES}-byte base64 value`);
    }
};

export const generateBase64Key = () => {
    return toBase64(crypto.randomBytes(KEY_BYTES));
};

export const generateDataEncryptionKey = () => {
    return crypto.randomBytes(KEY_BYTES);
};

export const getMasterEncryptionKey = () => {
    const key = fromBase64(
        process.env.MEK_BASE64,
        "MEK_BASE64"
    );

    validateKey(key, "MEK_BASE64");

    return key;
};

export const getMasterKeyId = () => {
    return process.env.MEK_KEY_ID || "local-mek-v1";
};

// ======================================
// AES-256-GCM CORE
// ======================================

export const encryptBuffer = (plainBuffer, key, aad = "") => {
    validateKey(key, "Encryption key");

    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_BYTES
    });

    if (aad) {
        cipher.setAAD(Buffer.from(aad, TEXT_ENCODING));
    }

    const encrypted = Buffer.concat([
        cipher.update(plainBuffer),
        cipher.final()
    ]);

    return {
        algorithm: AES_ALGORITHM,
        iv: toBase64(iv),
        authTag: toBase64(cipher.getAuthTag()),
        ciphertext: toBase64(encrypted),
        encoding: STORAGE_ENCODING
    };
};

export const decryptBuffer = (encryptedPayload, key, aad = "") => {
    validateKey(key, "Decryption key");

    const decipher = crypto.createDecipheriv(
        encryptedPayload.algorithm || AES_ALGORITHM,
        key,
        fromBase64(encryptedPayload.iv, "IV"),
        {
            authTagLength: AUTH_TAG_BYTES
        }
    );

    if (aad) {
        decipher.setAAD(Buffer.from(aad, TEXT_ENCODING));
    }

    decipher.setAuthTag(
        fromBase64(encryptedPayload.authTag, "Auth tag")
    );

    return Buffer.concat([
        decipher.update(
            fromBase64(encryptedPayload.ciphertext, "Ciphertext")
        ),
        decipher.final()
    ]);
};

// ======================================
// ENVELOPE ENCRYPTION
// ======================================

export const encryptWithNewDek = (plainText, aad = "") => {
    const dek = generateDataEncryptionKey();
    const mek = getMasterEncryptionKey();

    const encryptedData = encryptBuffer(
        Buffer.from(plainText, TEXT_ENCODING),
        dek,
        aad
    );

    const encryptedDek = encryptBuffer(
        dek,
        mek,
        `${aad}:dek`
    );

    dek.fill(0);

    return {
        encryptedData,
        keyEnvelope: {
            encryptedDek,
            keyId: getMasterKeyId(),
            keyVersion: Number(process.env.MEK_KEY_VERSION || 1),
            wrappedAt: new Date()
        }
    };
};

export const decryptWithEnvelope = (encryptedData, keyEnvelope, aad = "") => {
    if (keyEnvelope.keyId !== getMasterKeyId()) {
        throw new Error("Encrypted DEK was created with a different MEK key id");
    }

    const mek = getMasterEncryptionKey();
    const dek = decryptBuffer(
        keyEnvelope.encryptedDek,
        mek,
        `${aad}:dek`
    );

    try {
        return decryptBuffer(
            encryptedData,
            dek,
            aad
        ).toString(TEXT_ENCODING);
    }

    finally {
        dek.fill(0);
    }
};
