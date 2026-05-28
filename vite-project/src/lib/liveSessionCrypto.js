const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function bytesToBase64Url(bytes) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let idx = 0; idx < binary.length; idx += 1) {
    bytes[idx] = binary.charCodeAt(idx);
  }

  return bytes;
}

export function createRandomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function derivePbkdf2KeyBytes({ context, salt, iterations }) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(context),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derivedBits);
}

async function importAesKey(bytes, usage) {
  return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, [usage]);
}

export async function encryptJsonWithSessionKey({ sessionKeyBytes, payload }) {
  const iv = createRandomBytes(12);
  const key = await importAesKey(sessionKeyBytes, "encrypt");
  const encodedPayload = textEncoder.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedPayload);

  return {
    algorithm: "AES-GCM",
    iv: bytesToBase64Url(iv),
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
    encoding: "base64url",
  };
}

export async function decryptJsonWithSessionKey({ sessionKeyBytes, encryptedPayload }) {
  const key = await importAesKey(sessionKeyBytes, "decrypt");
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64UrlToBytes(encryptedPayload.iv),
    },
    key,
    base64UrlToBytes(encryptedPayload.ciphertext)
  );

  return JSON.parse(textDecoder.decode(plaintext));
}

export async function wrapSessionKey({ sessionKeyBytes, wrapKeyBytes }) {
  const wrapKey = await importAesKey(wrapKeyBytes, "encrypt");
  const iv = createRandomBytes(12);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapKey, sessionKeyBytes);

  return {
    algorithm: "AES-GCM",
    iv: bytesToBase64Url(iv),
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
    encoding: "base64url",
  };
}

export const PASSWORD_KDF_ITERATIONS = 210000;

export async function derivePasswordKey(password, saltBytes, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derivedBits);
}

export async function combineLinkAndPasswordKeys(linkKeyBytes, password, passwordKdf) {
  if (!password) {
    return linkKeyBytes;
  }

  const passwordKeyBytes = await derivePasswordKey(
    password,
    passwordKdf.saltBytes,
    passwordKdf.iterations
  );
  const combinedKeyMaterial = new Uint8Array(linkKeyBytes.length + passwordKeyBytes.length);

  combinedKeyMaterial.set(linkKeyBytes);
  combinedKeyMaterial.set(passwordKeyBytes, linkKeyBytes.length);

  const combinedDigest = await crypto.subtle.digest("SHA-256", combinedKeyMaterial);

  return new Uint8Array(combinedDigest);
}

export async function createStandardEncryptedShare({
  secretName,
  message,
  attachment,
  expiration,
  password,
  burnAfterReading = false,
  getExpirationDate,
}) {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto is not available in this browser.");
  }

  const linkKeyBytes = createRandomBytes(32);
  const iv = createRandomBytes(12);
  const trimmedPassword = password?.trim() || "";
  const passwordProtected = Boolean(trimmedPassword);
  const passwordKdf = passwordProtected
    ? {
        algorithm: "PBKDF2-SHA-256",
        saltBytes: createRandomBytes(16),
        iterations: PASSWORD_KDF_ITERATIONS,
      }
    : null;
  const encryptionKeyBytes = await combineLinkAndPasswordKeys(
    linkKeyBytes,
    trimmedPassword,
    passwordKdf
  );
  const key = await importAesKey(encryptionKeyBytes, "encrypt");
  const payload = textEncoder.encode(
    JSON.stringify({
      title: secretName,
      message,
      attachment,
      expiration,
      passwordProtected,
      burnAfterReading: Boolean(burnAfterReading),
      createdAt: new Date().toISOString(),
    })
  );
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);

  return {
    encryptedPayload: {
      algorithm: "AES-GCM",
      iv: bytesToBase64Url(iv),
      ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
      encoding: "base64url",
    },
    expiresAt: getExpirationDate(expiration).toISOString(),
    burnAfterReading: Boolean(burnAfterReading),
    passwordProtected,
    passwordKdf: passwordKdf
      ? {
          algorithm: passwordKdf.algorithm,
          salt: bytesToBase64Url(passwordKdf.saltBytes),
          iterations: passwordKdf.iterations,
        }
      : undefined,
    shareKey: bytesToBase64Url(linkKeyBytes),
  };
}

export async function unwrapSessionKey({ wrappedSessionKey, wrapKeyBytes }) {
  const wrapKey = await importAesKey(wrapKeyBytes, "decrypt");
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64UrlToBytes(wrappedSessionKey.iv),
    },
    wrapKey,
    base64UrlToBytes(wrappedSessionKey.ciphertext)
  );

  return new Uint8Array(decrypted);
}
