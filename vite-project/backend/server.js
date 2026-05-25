import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

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
app.use("/api/auth", authRouter);
app.use("/", authRouter);

// ======================================
// HOME ROUTE
// ======================================

app.get('/', (req, res) => {

    res.send("Sekura Backend Running");

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
