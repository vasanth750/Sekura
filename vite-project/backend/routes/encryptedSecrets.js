import express from "express";
import mongoose from "mongoose";

import auth from "../middleware/auth.js";
import EncryptedSecret from "../models/EncryptedSecret.js";
import {
    decryptWithEnvelope,
    encryptWithNewDek
} from "../utils/encryption.js";

const router = express.Router();
const allowedSecretTypes = ["secret", "note", "message", "file"];

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
            originalFileName
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

        const secret = await EncryptedSecret.create({
            owner: req.user.id,
            title: title.trim(),
            type,
            encryptedData: encrypted.encryptedData,
            keyEnvelope: encrypted.keyEnvelope,
            metadata: {
                contentType,
                originalFileName,
                byteLength: Buffer.byteLength(value, "utf8"),
                encryptionVersion: 1
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

        return res.status(200).json({
            secrets
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

        return res.status(200).json({
            secret: {
                id: secret._id,
                title: secret.title,
                type: secret.type,
                value,
                metadata: secret.metadata,
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
