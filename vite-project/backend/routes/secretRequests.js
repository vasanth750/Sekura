import crypto from "crypto";
import express from "express";

import auth from "../middleware/auth.js";
import EncryptedSecret from "../models/EncryptedSecret.js";
import SecretRequest from "../models/SecretRequest.js";
import { encryptWithNewDek } from "../utils/encryption.js";

const router = express.Router();

const requestTokenPattern = /^[A-Za-z0-9_-]{16,96}$/;
const defaultRequestLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const allowedSecretTypes = ["secret", "note", "message", "file"];

function createRequestToken() {
  return crypto.randomBytes(24).toString("base64url");
}

// ======================================
// CREATE SECRET COLLECTION REQUEST
// ======================================

router.post("/", auth, async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";

    if (title.length < 3 || title.length > 120) {
      return res.status(400).json({
        message: "Request name must be between 3 and 120 characters",
      });
    }

    let token = createRequestToken();

    while (await SecretRequest.exists({ token })) {
      token = createRequestToken();
    }

    const secretRequest = await SecretRequest.create({
      owner: req.user.id,
      token,
      title,
      expiresAt: new Date(Date.now() + defaultRequestLifetimeMs),
    });

    return res.status(201).json({
      message: "Request link created",
      request: {
        id: secretRequest.token,
        title: secretRequest.title,
        status: secretRequest.status,
        expiresAt: secretRequest.expiresAt,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to create request link",
    });
  }
});

// ======================================
// PUBLIC REQUEST METADATA
// ======================================

router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    if (!requestTokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid request link",
      });
    }

    const secretRequest = await SecretRequest.findOne({ token }).select(
      "title status expiresAt submittedAt"
    );

    if (!secretRequest) {
      return res.status(404).json({
        message: "Request link not found",
      });
    }

    if (secretRequest.expiresAt <= new Date()) {
      return res.status(410).json({
        message: "This request link has expired",
      });
    }

    return res.status(200).json({
      request: {
        id: token,
        title: secretRequest.title,
        status: secretRequest.status,
        expiresAt: secretRequest.expiresAt,
        submittedAt: secretRequest.submittedAt,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to load request link",
    });
  }
});

// ======================================
// PUBLIC SUBMIT REQUESTED SECRET
// ======================================

router.post("/:token/submit", async (req, res) => {
  try {
    const { token } = req.params;
    const value = typeof req.body.value === "string" ? req.body.value : "";
    const type = typeof req.body.type === "string" ? req.body.type : "secret";
    const contentType =
      typeof req.body.contentType === "string" && req.body.contentType.trim()
        ? req.body.contentType.trim()
        : "text/plain";
    const originalFileName =
      typeof req.body.originalFileName === "string"
        ? req.body.originalFileName.trim().slice(0, 180)
        : "";
    const submittedByteLength = Number(req.body.byteLength);

    if (!requestTokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid request link",
      });
    }

    if (value.trim().length < 1) {
      return res.status(400).json({
        message: "Secret value is required",
      });
    }

    if (!allowedSecretTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid secret type",
      });
    }

    if (Buffer.byteLength(value, "utf8") > 1500000) {
      return res.status(413).json({
        message: "Secret value is too large",
      });
    }

    const secretRequest = await SecretRequest.findOne({ token });

    if (!secretRequest) {
      return res.status(404).json({
        message: "Request link not found",
      });
    }

    if (secretRequest.expiresAt <= new Date()) {
      return res.status(410).json({
        message: "This request link has expired",
      });
    }

    if (secretRequest.status === "submitted") {
      return res.status(409).json({
        message: "This request has already received a secret",
      });
    }

    const aad = `${secretRequest.owner}:${type}`;
    const encrypted = encryptWithNewDek(value, aad);
    const metadataByteLength =
      type === "file" && Number.isFinite(submittedByteLength)
        ? submittedByteLength
        : Buffer.byteLength(value, "utf8");

    const secret = await EncryptedSecret.create({
      owner: secretRequest.owner,
      title: secretRequest.title,
      type,
      encryptedData: encrypted.encryptedData,
      keyEnvelope: encrypted.keyEnvelope,
      metadata: {
        contentType,
        originalFileName,
        byteLength: metadataByteLength,
        encryptionVersion: 1,
        source: "request",
      },
    });

    secretRequest.status = "submitted";
    secretRequest.submittedSecret = secret._id;
    secretRequest.submittedAt = new Date();

    await secretRequest.save();

    return res.status(201).json({
      message: "Secret submitted and encrypted into the requester workspace",
      secret: {
        id: secret._id,
        title: secret.title,
        type: secret.type,
        metadata: secret.metadata,
        createdAt: secret.createdAt,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to submit secret",
    });
  }
});

export default router;
