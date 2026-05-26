import express from "express";

import { sendOtp, verifyOtp } from "../controllers/authController.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimiter.js";

// Auth routes for Brevo-backed email OTP authentication.
const router = express.Router();

router.post("/send-otp", sendOtpLimiter, sendOtp);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);

export default router;
