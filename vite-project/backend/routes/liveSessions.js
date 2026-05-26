import bcrypt from "bcrypt";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";

import auth from "../middleware/auth.js";
import LiveSession from "../models/LiveSession.js";
import { sendOtpEmail } from "../services/brevoService.js";
import generateOTP from "../utils/generateOTP.js";
import { normalizeEmail } from "../controllers/authController.js";

const router = express.Router();

const tokenPattern = /^[A-Za-z0-9_-]{16,96}$/;
const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
const participantEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpPattern = /^\d{6}$/;
const maxSessionLifetimeMs = 30 * 60 * 1000;
const maxEncryptedPayloadBytes = 250000;
const otpTtlMs = 5 * 60 * 1000;
const otpResendCooldownMs = 60 * 1000;
const maxOtpAttempts = 5;
const otpHashRounds = 12;

const participantOtpStore = new Map();

function createSessionToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function getOtpStoreKey(sessionToken, email) {
  return `${sessionToken}:${email}`;
}

function isBase64Url(value) {
  return typeof value === "string" && base64UrlPattern.test(value);
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

function cleanupExpiredSessionOtps() {
  const now = Date.now();

  for (const [key, value] of participantOtpStore.entries()) {
    if (value.expiresAt <= now) {
      participantOtpStore.delete(key);
    }
  }
}

function signParticipantToken({ sessionToken, email }) {
  return jwt.sign(
    {
      type: "live-session-participant",
      sessionToken,
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
}

function verifyParticipantToken(req) {
  const header = req.headers.authorization;

  if (!header) {
    throw new Error("Participant token is required");
  }

  const token = header.split(" ")[1];

  if (!token) {
    throw new Error("Participant token is required");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== "live-session-participant") {
    throw new Error("Invalid participant token");
  }

  return decoded;
}

function getParticipant(session, email) {
  const normalized = normalizeEmail(email);
  const idx = session.participants.findIndex(
    (participant) => participant.email === normalized
  );

  if (idx === -1) {
    return {
      participant: null,
      index: -1,
      normalizedEmail: normalized,
    };
  }

  return {
    participant: session.participants[idx],
    index: idx,
    normalizedEmail: normalized,
  };
}

async function findActiveSessionByToken(sessionToken) {
  const liveSession = await LiveSession.findOne({ token: sessionToken });

  if (!liveSession) {
    return {
      error: {
        status: 404,
        message: "Live session not found",
      },
    };
  }

  const now = new Date();

  if (liveSession.expiresAt <= now) {
    if (liveSession.status !== "expired") {
      liveSession.status = "expired";
      await liveSession.save();
    }

    return {
      error: {
        status: 410,
        message: "This live session has expired",
      },
    };
  }

  if (liveSession.status === "ended") {
    return {
      error: {
        status: 423,
        message: "This live session was ended by the host",
      },
    };
  }

  return {
    session: liveSession,
  };
}

// ======================================
// CREATE LIVE SESSION
// ======================================
router.post("/", auth, async (req, res) => {
  try {
    const { title, encryptedPayload, expiresAt, kdf, policy } = req.body;
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

    const expiration = new Date(expiresAt);
    const nowMs = Date.now();

    if (Number.isNaN(expiration.getTime()) || expiration.getTime() <= nowMs) {
      return res.status(400).json({
        message: "Expiration time must be in the future",
      });
    }

    if (expiration.getTime() - nowMs > maxSessionLifetimeMs) {
      return res.status(400).json({
        message: "Live sessions cannot run longer than 30 minutes",
      });
    }

    if (
      !kdf ||
      kdf.algorithm !== "PBKDF2-SHA-256" ||
      !isBase64Url(kdf.salt) ||
      !Number.isInteger(kdf.iterations)
    ) {
      return res.status(400).json({
        message: "KDF metadata is invalid",
      });
    }

    const maxViewCount = Number.isInteger(policy?.maxViewCount)
      ? policy.maxViewCount
      : 1;

    if (maxViewCount < 1 || maxViewCount > 10) {
      return res.status(400).json({
        message: "Policy maxViewCount must be between 1 and 10",
      });
    }

    let token = createSessionToken();
    while (await LiveSession.exists({ token })) {
      token = createSessionToken();
    }

    const liveSession = await LiveSession.create({
      owner: req.user.id,
      token,
      title: trimmedTitle,
      encryptedPayload,
      kdf: {
        algorithm: kdf.algorithm,
        salt: kdf.salt,
        iterations: kdf.iterations,
      },
      policy: {
        maxViewCount,
      },
      expiresAt: expiration,
      status: "active",
      participants: [],
    });

    return res.status(201).json({
      message: "Live session created",
      session: {
        id: liveSession.token,
        title: liveSession.title,
        status: liveSession.status,
        expiresAt: liveSession.expiresAt,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to create live session",
    });
  }
});

// ======================================
// HOST VIEW OF SESSION STATUS
// ======================================
router.get("/:token/host-status", auth, async (req, res) => {
  try {
    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid live session token",
      });
    }

    const session = await LiveSession.findOne({
      token,
      owner: req.user.id,
    }).select("token title status expiresAt policy participants createdAt");

    if (!session) {
      return res.status(404).json({
        message: "Live session not found",
      });
    }

    const now = new Date();
    const isExpired = session.expiresAt <= now || session.status === "expired";

    return res.status(200).json({
      session: {
        id: session.token,
        title: session.title,
        status: isExpired ? "expired" : session.status,
        expiresAt: session.expiresAt,
        policy: session.policy,
        createdAt: session.createdAt,
      },
      participants: session.participants.map((participant) => ({
        email: participant.email,
        status: participant.status,
        verifiedAt: participant.verifiedAt,
        joinedAt: participant.joinedAt,
        lastSeenAt: participant.lastSeenAt,
        viewCount: participant.viewCount || 0,
        hasWrappedSessionKey: Boolean(participant.wrappedSessionKey),
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to load live session status",
    });
  }
});

// ======================================
// PARTICIPANT SEND OTP
// ======================================
router.post("/:token/send-otp", async (req, res) => {
  let normalizedEmail = "";

  try {
    cleanupExpiredSessionOtps();

    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid live session token",
      });
    }

    const lookup = await findActiveSessionByToken(token);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        message: lookup.error.message,
      });
    }

    normalizedEmail = normalizeEmail(req.body.email);

    if (!participantEmailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    const otpStoreKey = getOtpStoreKey(token, normalizedEmail);
    const otpEntry = participantOtpStore.get(otpStoreKey);

    if (otpEntry && otpEntry.nextResendAt > Date.now()) {
      const retryAfterSeconds = Math.ceil(
        (otpEntry.nextResendAt - Date.now()) / 1000
      );

      return res.status(429).json({
        message: "Please wait before requesting another OTP",
        retryAfterSeconds,
      });
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, otpHashRounds);

    participantOtpStore.set(otpStoreKey, {
      otpHash,
      expiresAt: Date.now() + otpTtlMs,
      nextResendAt: Date.now() + otpResendCooldownMs,
      attempts: 0,
    });

    await sendOtpEmail({
      email: normalizedEmail,
      otp,
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    if (normalizedEmail) {
      const otpStoreKey = getOtpStoreKey(req.params.token, normalizedEmail);
      participantOtpStore.delete(otpStoreKey);
    }

    console.log(error);
    return res.status(500).json({
      message: "Unable to send OTP for this live session",
    });
  }
});

// ======================================
// PARTICIPANT VERIFY OTP
// ======================================
router.post("/:token/verify-otp", async (req, res) => {
  try {
    cleanupExpiredSessionOtps();

    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid live session token",
      });
    }

    const lookup = await findActiveSessionByToken(token);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        message: lookup.error.message,
      });
    }

    const liveSession = lookup.session;
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!participantEmailPattern.test(email)) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    if (!otpPattern.test(otp)) {
      return res.status(400).json({
        message: "Valid 6 digit OTP is required",
      });
    }

    const otpStoreKey = getOtpStoreKey(token, email);
    const otpEntry = participantOtpStore.get(otpStoreKey);

    if (!otpEntry) {
      return res.status(400).json({
        message: "OTP not found or expired",
      });
    }

    if (otpEntry.expiresAt <= Date.now()) {
      participantOtpStore.delete(otpStoreKey);
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (otpEntry.attempts >= maxOtpAttempts) {
      participantOtpStore.delete(otpStoreKey);
      return res.status(429).json({
        message: "Too many OTP attempts. Request a new code",
      });
    }

    const otpMatches = await bcrypt.compare(otp, otpEntry.otpHash);

    if (!otpMatches) {
      otpEntry.attempts += 1;
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    participantOtpStore.delete(otpStoreKey);

    const participantLookup = getParticipant(liveSession, email);

    if (participantLookup.participant) {
      liveSession.participants[participantLookup.index].status = "verified";
      liveSession.participants[participantLookup.index].verifiedAt = new Date();
    } else {
      liveSession.participants.push({
        email,
        status: "verified",
        verifiedAt: new Date(),
        viewCount: 0,
      });
    }

    await liveSession.save();

    const participantToken = signParticipantToken({
      sessionToken: token,
      email,
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      participantToken,
      participant: {
        email,
        status: "verified",
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to verify OTP for this live session",
    });
  }
});

// ======================================
// HOST WRAPS SESSION KEY FOR PARTICIPANT
// ======================================
router.post("/:token/participants/:email/wrap", auth, async (req, res) => {
  try {
    const { token, email: encodedEmail } = req.params;
    const email = normalizeEmail(decodeURIComponent(encodedEmail));

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid live session token",
      });
    }

    const payloadError = validateEncryptedPayload(req.body.wrappedSessionKey);
    if (payloadError) {
      return res.status(400).json({
        message: payloadError,
      });
    }

    const liveSession = await LiveSession.findOne({
      token,
      owner: req.user.id,
    });

    if (!liveSession) {
      return res.status(404).json({
        message: "Live session not found",
      });
    }

    if (liveSession.status !== "active") {
      return res.status(423).json({
        message: "Live session is not active",
      });
    }

    if (liveSession.expiresAt <= new Date()) {
      liveSession.status = "expired";
      await liveSession.save();
      return res.status(410).json({
        message: "This live session has expired",
      });
    }

    const participantLookup = getParticipant(liveSession, email);

    if (!participantLookup.participant) {
      return res.status(404).json({
        message: "Participant not found for this session",
      });
    }

    if (participantLookup.participant.status !== "verified") {
      return res.status(409).json({
        message: "Participant is not verified yet",
      });
    }

    liveSession.participants[participantLookup.index].wrappedSessionKey =
      req.body.wrappedSessionKey;
    await liveSession.save();

    return res.status(200).json({
      message: "Wrapped session key stored",
      participant: {
        email,
        status: liveSession.participants[participantLookup.index].status,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to store wrapped session key",
    });
  }
});

// ======================================
// PARTICIPANT GET SESSION PACKAGE
// ======================================
router.get("/:token/package", async (req, res) => {
  try {
    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid live session token",
      });
    }

    let participantClaims;
    try {
      participantClaims = verifyParticipantToken(req);
    } catch {
      return res.status(401).json({
        message: "Participant authentication is required",
      });
    }

    if (participantClaims.sessionToken !== token) {
      return res.status(403).json({
        message: "Participant token does not match this session",
      });
    }

    const lookup = await findActiveSessionByToken(token);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        message: lookup.error.message,
      });
    }

    const liveSession = lookup.session;
    const participantLookup = getParticipant(liveSession, participantClaims.email);

    if (!participantLookup.participant) {
      return res.status(403).json({
        message: "Participant not allowed in this live session",
      });
    }

    if (participantLookup.participant.status === "revoked") {
      return res.status(403).json({
        message: "Participant access has been revoked",
      });
    }

    if (participantLookup.participant.status !== "verified") {
      return res.status(403).json({
        message: "Participant is not verified",
      });
    }

    if (!participantLookup.participant.wrappedSessionKey) {
      return res.status(202).json({
        message: "Waiting for host approval",
        status: "waiting_for_wrapped_key",
      });
    }

    return res.status(200).json({
      session: {
        id: liveSession.token,
        title: liveSession.title,
        status: liveSession.status,
        expiresAt: liveSession.expiresAt,
        policy: liveSession.policy,
      },
      kdf: liveSession.kdf,
      encryptedPayload: liveSession.encryptedPayload,
      wrappedSessionKey: participantLookup.participant.wrappedSessionKey,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to load live session package",
    });
  }
});

// ======================================
// PARTICIPANT MARK SESSION OPEN
// ======================================
router.post("/:token/open", async (req, res) => {
  try {
    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid live session token",
      });
    }

    let participantClaims;
    try {
      participantClaims = verifyParticipantToken(req);
    } catch {
      return res.status(401).json({
        message: "Participant authentication is required",
      });
    }

    if (participantClaims.sessionToken !== token) {
      return res.status(403).json({
        message: "Participant token does not match this session",
      });
    }

    const lookup = await findActiveSessionByToken(token);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        message: lookup.error.message,
      });
    }

    const liveSession = lookup.session;
    const participantLookup = getParticipant(liveSession, participantClaims.email);

    if (!participantLookup.participant || participantLookup.participant.status !== "verified") {
      return res.status(403).json({
        message: "Participant is not verified",
      });
    }

    const participant = liveSession.participants[participantLookup.index];
    const maxViewCount = liveSession.policy?.maxViewCount || 1;

    if (participant.viewCount >= maxViewCount) {
      return res.status(409).json({
        message: "Maximum views reached",
      });
    }

    participant.viewCount += 1;
    participant.joinedAt = participant.joinedAt || new Date();
    participant.lastSeenAt = new Date();
    await liveSession.save();

    return res.status(200).json({
      message: "Session opened",
      usage: {
        viewCount: participant.viewCount,
        remainingViews: Math.max(0, maxViewCount - participant.viewCount),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to mark live session as opened",
    });
  }
});

// ======================================
// HOST END SESSION
// ======================================
router.post("/:token/end", auth, async (req, res) => {
  try {
    const { token } = req.params;

    if (!tokenPattern.test(token)) {
      return res.status(400).json({
        message: "Invalid live session token",
      });
    }

    const liveSession = await LiveSession.findOne({
      token,
      owner: req.user.id,
    });

    if (!liveSession) {
      return res.status(404).json({
        message: "Live session not found",
      });
    }

    liveSession.status = "ended";
    liveSession.endedAt = new Date();
    await liveSession.save();

    return res.status(200).json({
      message: "Live session ended",
      session: {
        id: liveSession.token,
        status: liveSession.status,
        endedAt: liveSession.endedAt,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to end live session",
    });
  }
});

export default router;
