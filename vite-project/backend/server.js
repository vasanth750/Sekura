import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import auth from "./middleware/auth.js";

import connectDB from './config/db.js';
import transporter from './config/mail.js';

import User from './user.js';
import encryptedSecretsRouter from "./routes/encryptedSecrets.js";
import secretRequestsRouter from "./routes/secretRequests.js";
import shareLinksRouter from "./routes/shareLinks.js";

dotenv.config();

connectDB();

const app = express();

const corsOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
    : true;

app.use(cors({
    origin: corsOrigins
}));

app.use(express.json({
    limit: "256kb"
}));

// ======================================
// API ROUTES
// ======================================

app.use("/api/encrypted-secrets", encryptedSecretsRouter);
app.use("/api/secret-requests", secretRequestsRouter);
app.use("/api/share-links", shareLinksRouter);

// ======================================
// OTP STORE
// ======================================

const otpStore = new Map();

function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function hashOtp(email, otp) {
    return crypto
        .createHash("sha256")
        .update(`${email}:${otp}:${process.env.JWT_SECRET}`)
        .digest("hex");
}

function secureCompareHash(left, right) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
        leftBuffer.length === rightBuffer.length &&
        crypto.timingSafeEqual(leftBuffer, rightBuffer)
    );
}

// ======================================
// HOME ROUTE
// ======================================

app.get('/', (req, res) => {

    res.send("Sekura Backend Running");

});

// ======================================
// SEND OTP API
// ======================================

app.post("/send-otp", async (req, res) => {

    try {

        const {
            Email
        } = req.body;
        const normalizedEmail = normalizeEmail(Email);


        // =========================
        // EMAIL VALIDATION
        // =========================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {

            return res.status(400).json({

                message:
                    "Invalid Email Address"

            });

        }



        // =========================
        // CHECK EXISTING USER
        // =========================

        const existingUser =
            await User.findOne({

                email: normalizedEmail

            });

        if (existingUser) {

            return res.status(409).json({

                message:
                    "Email already registered"

            });

        }

        // =========================
        // GENERATE OTP
        // =========================

        const verificationCode =
            crypto.randomInt(100000, 1000000).toString();

        // =========================
        // STORE OTP
        // =========================

        otpStore.set(normalizedEmail, {

            otpHash: hashOtp(normalizedEmail, verificationCode),

            expires:
                Date.now() + 5 * 60 * 1000,

            verified: false,

            attempts: 0

        });

        // =========================
        // SEND EMAIL
        // =========================

        await transporter.sendMail({

            from:
                `"Sekura" <${process.env.EMAIL_USER}>`,

            to: normalizedEmail,

            replyTo:
                process.env.EMAIL_USER,

            subject:
                "Sekura Verification Code",

            html: `

                <div style="font-family: Arial; padding: 20px;">

                    <h2>Sekura Email Verification</h2>

                    <p>Your OTP for Signup is:</p>

                    <h1 style="letter-spacing: 5px; color: #06b6d4;">
                        ${verificationCode}
                    </h1>

                    <p>
                        This OTP is valid for 5 minutes.
                    </p>

                </div>

            `

        });

        res.status(200).json({

            message:
                "OTP Sent Successfully"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Server Error"

        });

    }

});

// ======================================
// VERIFY OTP API
// ======================================

app.post("/verify-otp", async (req, res) => {

    try {

        const {
            Email,
            OTP
        } = req.body;
        const normalizedEmail = normalizeEmail(Email);
        const otpEntry = otpStore.get(normalizedEmail);

        // =========================
        // OTP EXIST?
        // =========================

        if (!otpEntry) {

            return res.status(400).json({

                message:
                    "OTP not found"

            });

        }

        // =========================
        // OTP EXPIRED
        // =========================

        if (
            otpEntry.expires
            < Date.now()
        ) {
            otpStore.delete(normalizedEmail);

            return res.status(400).json({

                message:
                    "OTP Expired"

            });

        }

        // =========================
        // OTP VALIDATION
        // =========================

        if (otpEntry.attempts >= 5) {
            otpStore.delete(normalizedEmail);

            return res.status(429).json({

                message:
                    "Too many OTP attempts. Request a new code"

            });

        }

        const otpHash = hashOtp(normalizedEmail, String(OTP || ""));

        if (!secureCompareHash(otpEntry.otpHash, otpHash)) {
            otpEntry.attempts += 1;

            return res.status(400).json({

                message:
                    "Invalid OTP"

            });

        }

        // =========================
        // VERIFIED
        // =========================

        otpEntry.verified = true;

        res.status(200).json({

            message:
                "OTP Verified"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Server Error"

        });

    }

});

// ======================================
// SIGNUP API
// ======================================

app.post("/newUser", async (req, res) => {

    try {

        const {
            Name,
            Email,
            Password,
            RePassword
        } = req.body;
        const normalizedEmail = normalizeEmail(Email);
        const otpEntry = otpStore.get(normalizedEmail);

        // =========================
        // EMAIL VERIFIED?
        // =========================

        if (
            !otpEntry ||
            !otpEntry.verified
        ) {

            return res.status(401).json({

                message:
                    "Email not verified"

            });

        }

        // =========================
        // NAME VALIDATION
        // =========================

        if (
            !Name ||
            Name.length < 3
        ) {

            return res.status(400).json({

                message:
                    "Name must contain minimum 3 characters"

            });

        }

        // =========================
        // PASSWORD MATCH VALIDATION
        // =========================

        if (Password !== RePassword) {

            return res.status(400).json({

                message:
                    "Passwords do not match"

            });

        }

        // =========================
        // PASSWORD VALIDATION
        // =========================

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (
            !passwordPattern.test(Password)
        ) {

            return res.status(400).json({

                message:
                    "Password must contain uppercase, lowercase, number and special character"

            });

        }

        // =========================
        // HASH PASSWORD
        // =========================

        const hashedPassword =
            await argon2.hash(Password);

        // =========================
        // CREATE USER
        // =========================

        const user = new User({

            name: Name,

            email: normalizedEmail,

            password: hashedPassword,

            isVerified: true

        });

        await user.save();

        // =========================
        // REMOVE OTP
        // =========================

        otpStore.delete(normalizedEmail);

        // =========================
        // GENERATE JWT
        // =========================

        const token = jwt.sign(

            {
                id: user._id,
                email: user.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        res.status(201).json({

            message:
                "Signup Successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Server Error"

        });

    }

});

// ======================================
// LOGIN API
// ======================================

app.post("/login", async (req, res) => {

    try {

        const {
            Email,
            Password
        } = req.body;
        const normalizedEmail = normalizeEmail(Email);

        // =========================
        // FIND USER
        // =========================

        const userValidation =
            await User.findOne({

                email: normalizedEmail

            });

        if (!userValidation) {

            return res.status(404).json({

                message:
                    "Create an Account to Login"

            });

        }

        // =========================
        // EMAIL VERIFIED?
        // =========================

       

        // =========================
        // VERIFY PASSWORD
        // =========================

        const validPassword =
            await argon2.verify(

                userValidation.password,

                Password

            );

        if (!validPassword) {

            return res.status(401).json({

                message:
                    "Password Incorrect"

            });

        }

        // =========================
        // GENERATE JWT
        // =========================

        const token = jwt.sign(

            {
                id: userValidation._id,
                email: userValidation.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        res.status(200).json({

            message:
                "Login Successful",

            token,

            user: {

                id: userValidation._id,

                name: userValidation.name,

                email: userValidation.email

            }

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Server Error"

        });

    }

});

// ======================================
// PROTECTED ROUTE
// ======================================

app.get("/secrets", auth, (req, res) => {

    res.status(200).json({

        message:
            "Token received successfully",

        user: req.user,

    });

});

// ======================================
// SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`

    );

});
