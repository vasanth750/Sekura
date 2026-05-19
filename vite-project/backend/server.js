import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import auth from "./middleware/auth.js";
import connectDB from './config/db.js';
import transporter from './config/mail.js';

import User from './user.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

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
            Name,
            Email,
            Password
        } = req.body;

        // =========================
        // NAME VALIDATION
        // =========================

        if (!Name || Name.length < 3) {

            return res.status(400).json({

                message:
                    "Name must contain minimum 3 characters"

            });

        }

        // =========================
        // EMAIL VALIDATION
        // =========================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(Email)) {

            return res.status(400).json({

                message:
                    "Invalid Email Address"

            });

        }

        // =========================
        // PASSWORD VALIDATION
        // =========================

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordPattern.test(Password)) {

            return res.status(400).json({

                message:
                    "Password must contain uppercase, lowercase, number and special character"

            });

        }

        // =========================
        // CHECK EXISTING USER
        // =========================

        const existingUser =
            await User.findOne({

                email: Email

            });

        if (
            existingUser &&
            existingUser.isVerified
        ) {

            return res.status(409).json({

                message:
                    "Email already registered"

            });

        }

        // =========================
        // GENERATE OTP
        // =========================

        const verificationCode =
            Math.floor(

                100000 + Math.random() * 900000

            ).toString();

        // =========================
        // SAVE TEMP USER
        // =========================

        if (!existingUser) {

            const hashedPassword =
                await argon2.hash(Password);

            await User.create({

                name: Name,

                email: Email,

                password: hashedPassword,

                verificationCode,

                verificationCodeExpires:
                    Date.now() + 5 * 60 * 1000

            });

        }

        else {

            existingUser.verificationCode =
                verificationCode;

            existingUser.verificationCodeExpires =
                Date.now() + 5 * 60 * 1000;

            await existingUser.save();

        }

        // =========================
        // SEND EMAIL
        // =========================

        await transporter.sendMail({

            from:
                `"Sekura" <${process.env.EMAIL_USER}>`,

            to: Email,

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

        // =========================
        // FIND USER
        // =========================

        const user =
            await User.findOne({

                email: Email

            });

        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }

        // =========================
        // OTP EXPIRED
        // =========================

        if (
            user.verificationCodeExpires
            < Date.now()
        ) {

            return res.status(400).json({

                message:
                    "OTP Expired"

            });

        }

        // =========================
        // OTP VALIDATION
        // =========================

        if (
            user.verificationCode !== OTP
        ) {

            return res.status(400).json({

                message:
                    "Invalid OTP"

            });

        }

        // =========================
        // VERIFY USER
        // =========================

        user.isVerified = true;

        user.verificationCode = null;

        user.verificationCodeExpires = null;

        await user.save();

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

        res.status(200).json({

            message:
                "OTP Verified",

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

        // =========================
        // FIND USER
        // =========================

        const userValidation =
            await User.findOne({

                email: Email

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

        if (!userValidation.isVerified) {

            return res.status(401).json({

                message:
                    "Please verify your email"

            });

        }

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
// SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.get("/secrets", auth, (req, res) => {
    res.status(200).json({
        message: "Token received successfully",
        user: req.user,
    });
});

app.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`

    );

});