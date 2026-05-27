import crypto from "crypto";
import express from "express";

import auth from "../middleware/auth.js";
import ShareLink from "../models/ShareLink.js";

const router = express.Router();

const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
const tokenPattern = /^[A-Za-z0-9_-]{16,96}$/;
const maxLinkLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const maxEncryptedPayloadBytes = 1500000;
let shareLinkIndexesChecked = false;

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

async function ensureShareLinkDashboardIndexes() {
  if (shareLinkIndexesChecked) {
    return;
  }

  try {
    await ShareLink.collection.dropIndex("expiresAt_1");
  } catch (error) {
    if (error.codeName !== "IndexNotFound" && error.code !== 27) {
      console.log(error);
    }
  }

  shareLinkIndexesChecked = true;
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
      burnAfterReading = false,
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
// CURRENT USER SHARE LINK DASHBOARD STATS
// ======================================

router.get("/stats/summary", auth, async (req, res) => {
  try {
    await ensureShareLinkDashboardIndexes();

    const now = new Date();
    const expiringSoonAt = new Date(now.getTime() + 2 * 60 * 1000);
    const ownerFilter = {
      owner: req.user.id,
    };

    const activeFilter = {
      ...ownerFilter,
      expiresAt: {
        $gt: now,
      },
    };

    const [totalLinks, activeLinks, expiringSoon, recentLinks] = await Promise.all([
      ShareLink.countDocuments(ownerFilter),
      ShareLink.countDocuments(activeFilter),
      ShareLink.countDocuments({
        ...activeFilter,
        expiresAt: {
          $gt: now,
          $lte: expiringSoonAt,
        },
      }),
      ShareLink.find(ownerFilter)
        .select("title token expiresAt burnAfterReading passwordProtected readCount openedAt createdAt")
        .sort({
          createdAt: -1,
        }),
    ]);

    return res.status(200).json({
      totalLinks,
      activeLinks,
      expiringSoon,
      recentLinks,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to load secure link stats",
    });
  }
});

// ======================================
// MARK SHARE LINK AS REVEALED
// ======================================

router.post("/:token/open", async (req, res) => {
  try {
    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid secure link",
      });
    }

    const now = new Date();
    const shareLink = await ShareLink.findOne({
      token,
    }).select("expiresAt readCount");

    if (!shareLink) {
      return res.status(404).json({
        message: "Secure link not found",
      });
    }

    if (shareLink.expiresAt <= now) {
      return res.status(410).json({
        message: "This secure link has expired",
      });
    }

    shareLink.readCount += 1;
    shareLink.openedAt = now;

    await shareLink.save();

    return res.status(200).json({
      message: "Secure link marked as opened",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Unable to mark secure link as opened",
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
    const shareLink = await ShareLink.findOne({
      token,
    });

    if (!shareLink) {
      return res.status(404).json({
        message: "Secure link not found",
      });
    }

    if (shareLink.expiresAt <= now) {
      return res.status(410).json({
        message: "This secure link has expired",
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
