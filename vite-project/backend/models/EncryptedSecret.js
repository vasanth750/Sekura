import mongoose from "mongoose";

// ======================================
// REUSABLE ENCRYPTED PAYLOAD SCHEMA
// ======================================

const encryptedPayloadSchema = new mongoose.Schema(
    {
        algorithm: {
            type: String,
            required: true,
            default: "aes-256-gcm"
        },

        iv: {
            type: String,
            required: true
        },

        authTag: {
            type: String,
            required: true
        },

        ciphertext: {
            type: String,
            required: true
        },

        encoding: {
            type: String,
            required: true,
            default: "base64"
        }
    },
    {
        _id: false
    }
);

// ======================================
// KEY ENVELOPE SCHEMA
// ======================================

const keyEnvelopeSchema = new mongoose.Schema(
    {
        encryptedDek: {
            type: encryptedPayloadSchema,
            required: true
        },

        keyId: {
            type: String,
            required: true
        },

        keyVersion: {
            type: Number,
            required: true
        },

        wrappedAt: {
            type: Date,
            required: true
        }
    },
    {
        _id: false
    }
);

// ======================================
// ENCRYPTED SECRET SCHEMA
// ======================================

const encryptedSecretSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        type: {
            type: String,
            enum: ["secret", "note", "message", "file"],
            default: "secret",
            index: true
        },

        encryptedData: {
            type: encryptedPayloadSchema,
            required: true
        },

        keyEnvelope: {
            type: keyEnvelopeSchema,
            required: true
        },

        metadata: {
            contentType: {
                type: String,
                default: "text/plain"
            },

            originalFileName: {
                type: String,
                trim: true
            },

            byteLength: {
                type: Number,
                required: true
            },

            encryptionVersion: {
                type: Number,
                default: 1
            },

            source: {
                type: String,
                enum: ["manual", "request"],
                default: "manual"
            }
        }
    },
    {
        timestamps: true
    }
);

encryptedSecretSchema.index({
    owner: 1,
    createdAt: -1
});

const EncryptedSecret = mongoose.model(
    "EncryptedSecret",
    encryptedSecretSchema
);

export default EncryptedSecret;
