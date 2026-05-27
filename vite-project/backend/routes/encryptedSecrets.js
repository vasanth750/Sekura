import express from "express";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import EncryptedSecret from "../models/EncryptedSecret.js";
import SecretRequest from "../models/SecretRequest.js";
import {
    decryptWithEnvelope,
    encryptWithNewDek
} from "../utils/encryption.js";

const router = express.Router();
const allowedSecretTypes = ["secret", "note", "message", "file"];

const mergeSourceMetadata = (secret, source) => {
    const secretObject = typeof secret.toObject === "function" ? secret.toObject() : secret;

    return {
        ...secretObject,
        metadata: {
            ...(secretObject.metadata || {}),
            source
        }
    };
};

const getSecretSource = async (owner, secretId, currentSource) => {
    if (currentSource === "request") {
        return "request";
    }

    const requestedSecret = await SecretRequest.exists({
        owner,
        submittedSecret: secretId
    });

    return requestedSecret ? "request" : "manual";
};

// ======================================
// CREATE ENCRYPTED SECRET
// ======================================

router.post("/", auth, async (req, res) => {
    try {
        const {
            title,
            value,
            type = "secret",
            contentType = "text/plain",
            originalFileName,
            byteLength,
            source = "manual"
        } = req.body;

        if (!title || title.trim().length < 2) {
            return res.status(400).json({
                message: "Title must contain minimum 2 characters"
            });
        }

        if (!value || typeof value !== "string") {
            return res.status(400).json({
                message: "Value is required for encryption"
            });
        }

        if (!allowedSecretTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid secret type"
            });
        }

        const aad = `${req.user.id}:${type}`;
        const encrypted = encryptWithNewDek(value, aad);
        const metadataByteLength =
            type === "file" && Number.isFinite(Number(byteLength))
                ? Number(byteLength)
                : Buffer.byteLength(value, "utf8");

        const secret = await EncryptedSecret.create({
            owner: req.user.id,
            title: title.trim(),
            type,
            encryptedData: encrypted.encryptedData,
            keyEnvelope: encrypted.keyEnvelope,
            metadata: {
                contentType,
                originalFileName,
                byteLength: metadataByteLength,
                encryptionVersion: 1,
                source: source === "request" ? "request" : "manual"
            }
        });

        return res.status(201).json({
            message: "Secret encrypted and stored successfully",
            secret: {
                id: secret._id,
                title: secret.title,
                type: secret.type,
                metadata: secret.metadata,
                createdAt: secret.createdAt,
                updatedAt: secret.updatedAt
            }
        });
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Encryption failed"
        });
    }
});

// ======================================
// LIST ENCRYPTED SECRET METADATA
// ======================================

router.get("/", auth, async (req, res) => {
    try {
        const secrets = await EncryptedSecret.find({
            owner: req.user.id
        })
            .select("title type metadata keyEnvelope.keyId keyEnvelope.keyVersion createdAt updatedAt")
            .sort({
                createdAt: -1
            });

        const submittedRequests = await SecretRequest.find({
            owner: req.user.id,
            submittedSecret: {
                $in: secrets.map((secret) => secret._id)
            }
        }).select("submittedSecret");

        const requestedSecretIds = new Set(
            submittedRequests.map((request) => request.submittedSecret.toString())
        );

        const annotatedSecrets = secrets.map((secret) =>
            mergeSourceMetadata(
                secret,
                secret.metadata?.source === "request" ||
                    requestedSecretIds.has(secret._id.toString())
                    ? "request"
                    : "manual"
            )
        );

        return res.status(200).json({
            secrets: annotatedSecrets
        });
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Unable to fetch encrypted secrets"
        });
    }
});

// ======================================
// DECRYPT ONE SECRET
// ======================================

router.get("/:id/decrypt", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid secret id"
            });
        }

        const secret = await EncryptedSecret.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!secret) {
            return res.status(404).json({
                message: "Secret not found"
            });
        }

        const aad = `${req.user.id}:${secret.type}`;
        const value = decryptWithEnvelope(
            secret.encryptedData,
            secret.keyEnvelope,
            aad
        );
        const source = await getSecretSource(
            req.user.id,
            secret._id,
            secret.metadata?.source
        );

        return res.status(200).json({
            secret: {
                id: secret._id,
                title: secret.title,
                type: secret.type,
                value,
                metadata: {
                    ...(secret.metadata?.toObject?.() || secret.metadata || {}),
                    source
                },
                createdAt: secret.createdAt,
                updatedAt: secret.updatedAt
            }
        });
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Decryption failed"
        });
    }
});

// ======================================
// UPDATE ONE SECRET
// ======================================

router.put("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid secret id"
            });
        }

        const {
            title,
            value,
            type = "secret",
            contentType = "text/plain",
            originalFileName,
            byteLength
        } = req.body;

        if (!title || title.trim().length < 2) {
            return res.status(400).json({
                message: "Title must contain minimum 2 characters"
            });
        }

        if (!value || typeof value !== "string") {
            return res.status(400).json({
                message: "Value is required for encryption"
            });
        }

        if (!allowedSecretTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid secret type"
            });
        }

        const secret = await EncryptedSecret.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!secret) {
            return res.status(404).json({
                message: "Secret not found"
            });
        }

        const aad = `${req.user.id}:${type}`;
        const encrypted = encryptWithNewDek(value, aad);
        const metadataByteLength =
            type === "file" && Number.isFinite(Number(byteLength))
                ? Number(byteLength)
                : Buffer.byteLength(value, "utf8");
        const source = await getSecretSource(
            req.user.id,
            secret._id,
            secret.metadata?.source
        );

        secret.title = title.trim();
        secret.type = type;
        secret.encryptedData = encrypted.encryptedData;
        secret.keyEnvelope = encrypted.keyEnvelope;
        secret.metadata = {
            contentType,
            originalFileName: originalFileName || secret.metadata?.originalFileName,
            byteLength: metadataByteLength,
            encryptionVersion: 1,
            source
        };

        await secret.save();

        return res.status(200).json({
            message: "Secret updated successfully",
            secret: {
                id: secret._id,
                title: secret.title,
                type: secret.type,
                metadata: secret.metadata,
                createdAt: secret.createdAt,
                updatedAt: secret.updatedAt
            }
        });
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Unable to update secret"
        });
    }
});

// ======================================
// DELETE ONE SECRET
// ======================================

router.delete("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid secret id"
            });
        }

        const secret = await EncryptedSecret.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!secret) {
            return res.status(404).json({
                message: "Secret not found"
            });
        }

        return res.status(200).json({
            message: "Secret deleted successfully"
        });
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Unable to delete secret"
        });
    }
});

export default router;
