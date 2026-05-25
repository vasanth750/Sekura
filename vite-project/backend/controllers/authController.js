import bcrypt from "bcrypt";

import User from "../user.js";
import { sendOtpEmail } from "../services/brevoService.js";
import generateOTP from "../utils/generateOTP.js";
import { generateToken } from "../utils/token.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 12;

// In-memory OTP store for short-lived verification state.
const otpStore = new Map();

// Keeps legacy signup compatible after the OTP itself has been deleted.
const verifiedEmailStore = new Map();

// Normalizes emails so lookup and rate rules are consistent.
export const normalizeEmail = (email) =>
    typeof email === "string" ? email.trim().toLowerCase() : "";

// Validates the email format without accepting mailto/link markup.
const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Validates the OTP as exactly six digits.
const isValidOtp = (otp) =>
    /^\d{6}$/.test(String(otp || "").trim());

// Removes expired OTP entries opportunistically on each auth request.
const cleanupExpiredOtps = () => {
    const now = Date.now();

    for (const [email, entry] of otpStore.entries()) {
        if (entry.expiresAt <= now) {
            otpStore.delete(email);
        }
    }

    for (const [email, expiresAt] of verifiedEmailStore.entries()) {
        if (expiresAt <= now) {
            verifiedEmailStore.delete(email);
        }
    }
};

// Allows existing signup to require a recent successful OTP verification.
export const isEmailRecentlyVerified = (email) => {
    cleanupExpiredOtps();

    const normalizedEmail = normalizeEmail(email);
    const verifiedUntil = verifiedEmailStore.get(normalizedEmail);

    return Boolean(verifiedUntil && verifiedUntil > Date.now());
};

// Removes signup verification state once the account has been created.
export const clearEmailVerification = (email) => {
    verifiedEmailStore.delete(normalizeEmail(email));
};

// POST /api/auth/send-otp
export const sendOtp = async (req, res) => {
    let email = "";

    try {
        cleanupExpiredOtps();

        email = normalizeEmail(req.body.email || req.body.Email);

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Valid email is required"
            });
        }

        const existingEntry = otpStore.get(email);

        if (existingEntry && existingEntry.nextResendAt > Date.now()) {
            const retryAfterSeconds = Math.ceil(
                (existingEntry.nextResendAt - Date.now()) / 1000
            );

            return res.status(429).json({
                message: "Please wait before requesting another OTP",
                retryAfterSeconds
            });
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);

        otpStore.set(email, {
            otpHash,
            expiresAt: Date.now() + OTP_TTL_MS,
            nextResendAt: Date.now() + RESEND_COOLDOWN_MS,
            attempts: 0
        });

        await sendOtpEmail({
            email,
            otp
        });

        return res.status(200).json({
            message: "OTP sent successfully"
        });
    } catch (error) {
        if (email) {
            otpStore.delete(email);
        }

        console.error("sendOtp error:", error);

        return res.status(500).json({
            message: "Unable to send OTP"
        });
    }
};

// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        cleanupExpiredOtps();

        const email = normalizeEmail(req.body.email || req.body.Email);
        const otp = String(req.body.otp || req.body.OTP || "").trim();

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Valid email is required"
            });
        }

        if (!isValidOtp(otp)) {
            return res.status(400).json({
                message: "Valid 6 digit OTP is required"
            });
        }

        const otpEntry = otpStore.get(email);

        if (!otpEntry) {
            return res.status(400).json({
                message: "OTP not found or expired"
            });
        }

        if (otpEntry.expiresAt <= Date.now()) {
            otpStore.delete(email);

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        if (otpEntry.attempts >= MAX_VERIFY_ATTEMPTS) {
            otpStore.delete(email);

            return res.status(429).json({
                message: "Too many OTP attempts. Request a new code"
            });
        }

        const isMatch = await bcrypt.compare(otp, otpEntry.otpHash);

        if (!isMatch) {
            otpEntry.attempts += 1;

            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        otpStore.delete(email);
        verifiedEmailStore.set(email, Date.now() + OTP_TTL_MS);

        const user = await User.findOne({
            email
        }).select("_id name email");

        const tokenPayload = user
            ? {
                id: user._id,
                email: user.email
            }
            : {
                email
            };

        const token = generateToken(tokenPayload);

        return res.status(200).json({
            message: "OTP verified successfully",
            token,
            user: user
                ? {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
                : null
        });
    } catch (error) {
        console.error("verifyOtp error:", error);

        return res.status(500).json({
            message: "Unable to verify OTP"
        });
    }
};
