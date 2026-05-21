import crypto from "crypto";
import express from "express";

import auth from "../middleware/auth.js";
import ShareLink from "../models/ShareLink.js";

const router = express.Router();

const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
const tokenPattern = /^[A-Za-z0-9_-]{16,96}$/;
const maxLinkLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const maxEncryptedPayloadBytes = 200000;

function isBase64Url(value) {
  return typeof value === "string" && base64UrlPattern.test(value);
}

function createShareToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function validateEncryptedPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Encrypted payload is required";
  }

  if (payload.algorithm !== "AES-GCM" || payload.encoding !== "base64url") {
    return "Unsupported encrypted payload format";
  }

  if (!isBase64Url(payload.iv) || !isBase64Url(payload.ciphertext)) {
    return "Encrypted payload is malformed";
  }

  if (Buffer.byteLength(payload.ciphertext, "utf8") > maxEncryptedPayloadBytes) {
    return "Encrypted payload is too large";
  }

  return "";
}

// ======================================
// CREATE CLIENT-ENCRYPTED SHARE LINK
// ======================================

router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      encryptedPayload,
      expiresAt,
      burnAfterReading = true,
      passwordProtected = false,
      passwordKdf,
    } = req.body;

    const trimmedTitle = typeof title === "string" ? title.trim() : "";

    if (trimmedTitle.length < 3 || trimmedTitle.length > 120) {
      return res.status(400).json({
        message: "Title must be between 3 and 120 characters",
      });
    }

    const payloadError = validateEncryptedPayload(encryptedPayload);

    if (payloadError) {
      return res.status(400).json({
        message: payloadError,
      });
    }

    const expiry = new Date(expiresAt);
    const now = Date.now();

    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= now) {
      return res.status(400).json({
        message: "Expiration time must be in the future",
      });
    }

    if (expiry.getTime() - now > maxLinkLifetimeMs) {
      return res.status(400).json({
        message: "Secure links cannot live longer than 7 days",
      });
    }

    const hasPassword = Boolean(passwordProtected);

    if (hasPassword) {
      if (
        !passwordKdf ||
        passwordKdf.algorithm !== "PBKDF2-SHA-256" ||
        !isBase64Url(passwordKdf.salt) ||
        !Number.isInteger(passwordKdf.iterations)
      ) {
        return res.status(400).json({
          message: "Password protection metadata is invalid",
        });
      }
    }

    let token = createShareToken();

    while (await ShareLink.exists({ token })) {
      token = createShareToken();
    }

    const shareLink = await ShareLink.create({
      owner: req.user.id,
      token,
      title: trimmedTitle,
      encryptedPayload,
      expiresAt: expiry,
      burnAfterReading: Boolean(burnAfterReading),
      passwordProtected: hasPassword,
      passwordKdf: hasPassword ? passwordKdf : undefined,
    });

    return res.status(201).json({
      message: "Secure link stored without exposing the key",
      link: {
        id: shareLink.token,
        title: shareLink.title,
        expiresAt: shareLink.expiresAt,
        burnAfterReading: shareLink.burnAfterReading,
        passwordProtected: shareLink.passwordProtected,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to create secure link",
    });
  }
});

// ======================================
// PUBLIC READ OF ENCRYPTED SHARE PAYLOAD
// ======================================

router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid secure link",
      });
    }

    const now = new Date();
    const shareLink = await ShareLink.findOneAndUpdate(
      {
        token,
        expiresAt: {
          $gt: now,
        },
        $or: [
          {
            burnAfterReading: false,
          },
          {
            readCount: 0,
          },
        ],
      },
      {
        $inc: {
          readCount: 1,
        },
        $set: {
          openedAt: now,
        },
      }
    );

    if (!shareLink) {
      const existingLink = await ShareLink.findOne({ token }).select(
        "expiresAt burnAfterReading readCount"
      );

      if (!existingLink) {
        return res.status(404).json({
          message: "Secure link not found",
        });
      }

      if (existingLink.expiresAt <= now) {
        return res.status(410).json({
          message: "This secure link has expired",
        });
      }

      if (existingLink.burnAfterReading && existingLink.readCount > 0) {
        return res.status(410).json({
          message: "This secure link has already been opened",
        });
      }

      return res.status(410).json({
        message: "This secure link is no longer available",
      });
    }

    return res.status(200).json({
      link: {
        id: shareLink.token,
        title: shareLink.title,
        encryptedPayload: shareLink.encryptedPayload,
        expiresAt: shareLink.expiresAt,
        burnAfterReading: shareLink.burnAfterReading,
        passwordProtected: shareLink.passwordProtected,
        passwordKdf: shareLink.passwordKdf,
        createdAt: shareLink.createdAt,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to open secure link",
    });
  }
});

export default router;
