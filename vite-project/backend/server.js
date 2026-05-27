import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import auth from "./middleware/auth.js";

import connectDB from './config/db.js';

import User from './user.js';
import authRouter from "./routes/auth.js";
import {
    clearEmailVerification,
    isEmailRecentlyVerified,
    normalizeEmail
} from "./controllers/authController.js";
import encryptedSecretsRouter from "./routes/encryptedSecrets.js";
import secretRequestsRouter from "./routes/secretRequests.js";
import shareLinksRouter from "./routes/shareLinks.js";
import liveSessionsRouter from "./routes/liveSessions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, ".env")
});

connectDB();

const app = express();

const corsOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
    : true;

app.use(cors({
    origin: corsOrigins
}));

app.use(express.json({
    limit: "2mb"
}));

function isDatabaseConnected() {
    return mongoose.connection.readyState === 1;
}

function requireDatabaseConnection(req, res, next) {
    if (!isDatabaseConnected()) {
        return res.status(503).json({
            message: "Database connection unavailable. Check MongoDB Atlas network access and credentials."
        });
    }

    return next();
}

// ======================================
// API ROUTES
// ======================================

app.use("/api/encrypted-secrets", requireDatabaseConnection, encryptedSecretsRouter);
app.use("/api/secret-requests", requireDatabaseConnection, secretRequestsRouter);
app.use("/api/share-links", requireDatabaseConnection, shareLinksRouter);
app.use("/api/live-sessions", requireDatabaseConnection, liveSessionsRouter);
app.use("/api/auth", authRouter);
app.use("/", authRouter);

// ======================================
// HOME ROUTE
// ======================================

app.get('/', (req, res) => {

    res.send("Sekura Backend Running");

});

const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

async function verifyStoredPassword(storedPassword, submittedPassword) {
    if (
        typeof storedPassword !== "string" ||
        typeof submittedPassword !== "string" ||
        !storedPassword ||
        !submittedPassword
    ) {
        return false;
    }

    if (storedPassword.startsWith("$argon2")) {
        return argon2.verify(storedPassword, submittedPassword);
    }

    if (
        storedPassword.startsWith("$2a$") ||
        storedPassword.startsWith("$2b$") ||
        storedPassword.startsWith("$2y$")
    ) {
        return bcrypt.compare(submittedPassword, storedPassword);
    }

    return false;
}

// ======================================
// SIGNUP API
// ======================================

app.post("/newUser", async (req, res) => {

    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({
                message: "Database connection unavailable. Check MongoDB Atlas network access and credentials."
            });
        }

        const {
            Name,
            Email,
            Password,
            RePassword
        } = req.body;
        const normalizedEmail = normalizeEmail(Email);

        // =========================
        // EMAIL VERIFIED?
        // =========================

        if (!isEmailRecentlyVerified(normalizedEmail)) {

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
        // REMOVE EMAIL VERIFICATION
        // =========================

        clearEmailVerification(normalizedEmail);

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
// RESET PASSWORD API
// ======================================

app.post("/reset-password", async (req, res) => {

    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({
                message: "Database connection unavailable. Check MongoDB Atlas network access and credentials."
            });
        }

        const {
            Email,
            Password,
            RePassword
        } = req.body;
        const normalizedEmail = normalizeEmail(Email);

        if (!isEmailRecentlyVerified(normalizedEmail)) {

            return res.status(401).json({

                message:
                    "Email not verified"

            });

        }

        if (Password !== RePassword) {

            return res.status(400).json({

                message:
                    "Passwords do not match"

            });

        }

        if (!passwordPattern.test(Password)) {

            return res.status(400).json({

                message:
                    "Password must contain uppercase, lowercase, number and special character"

            });

        }

        const user = await User.findOne({

            email: normalizedEmail

        });

        if (!user) {

            clearEmailVerification(normalizedEmail);

            return res.status(404).json({

                message:
                    "Account not found"

            });

        }

        user.password = await argon2.hash(Password);

        await user.save();

        clearEmailVerification(normalizedEmail);

        return res.status(200).json({

            message:
                "Password reset successful"

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
        if (!isDatabaseConnected()) {
            return res.status(503).json({
                message: "Database connection unavailable. Check MongoDB Atlas network access and credentials."
            });
        }

        const {
            Email,
            Password
        } = req.body;
        const normalizedEmail = normalizeEmail(Email);

        if (!normalizedEmail || typeof Password !== "string") {
            return res.status(400).json({

                message:
                    "Email and password are required"

            });
        }

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
            await verifyStoredPassword(
                userValidation.password,
                Password
            );

        if (!validPassword) {

            return res.status(401).json({

                message:
                    "Password Incorrect"

            });

        }

        if (!userValidation.password.startsWith("$argon2")) {
            userValidation.password = await argon2.hash(Password);
            await userValidation.save();
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
