import rateLimit from "express-rate-limit";

// Limits OTP requests to slow down abuse against the email endpoint.
export const sendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many OTP requests. Please try again later"
    }
});

// Limits verification attempts at the route level in addition to per-OTP checks.
export const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many verification attempts. Please try again later"
    }
});
