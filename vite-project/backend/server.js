import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import connectDB from './config/db.js';
import transporter from './config/mail.js'

import User from './user.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

const otpStore = {};

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

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

        const { Email } = req.body;

        // CHECK EXISTING USER
        const existingUser =
            await User.findOne({

                email: Email

            });

        if (existingUser) {

            return res.status(409).json({

                message:
                    "Email already registered"

            });

        }

        // GENERATE OTP
        const verificationCode =
            Math.floor(

                100000 + Math.random() * 900000

            ).toString();

        // STORE OTP
        otpStore[Email] = {

            otp: verificationCode,

            expires:
                Date.now() + 5 * 60 * 1000

        };

        // SEND EMAIL
        await transporter.sendMail({

            from: `"Sekura" <${process.env.EMAIL_USER}>`,

            to: Email,

            replyTo: process.env.EMAIL_USER,

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

app.post("/verify-otp", (req, res) => {

    try {

        const {
            Email,
            OTP
        } = req.body;

        // OTP EXIST?
        if (!otpStore[Email]) {

            return res.status(400).json({

                message:
                    "OTP not found"

            });

        }

        // OTP EXPIRED?
        if (
            otpStore[Email].expires
            < Date.now()
        ) {

            return res.status(400).json({

                message:
                    "OTP Expired"

            });

        }

        // OTP MATCH?
        if (
            otpStore[Email].otp !== OTP
        ) {

            return res.status(400).json({

                message:
                    "Invalid OTP"

            });

        }

        // DELETE OTP AFTER SUCCESS
        delete otpStore[Email];

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
            Password
        } = req.body;

        // CHECK EXISTING USER
        const existingUser =
            await User.findOne({

                email: Email

            });

        if (existingUser) {

            return res.status(409).json({

                message:
                    "User already Exists"

            });

        }

        // HASH PASSWORD
        const hashedPassword =
            await argon2.hash(Password);

        // CREATE USER
        const user = new User({

            name: Name,

            email: Email,

            password: hashedPassword

        });

        await user.save();

        // GENERATE JWT
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

        // VERIFY PASSWORD
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

        // GENERATE JWT
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

app.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`

    );

});