import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
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
// SIGNUP API
// ======================================

app.post("/newUser", async (req, res) => {

    try {

        console.log(req.body);

        // Get frontend data
        const {
            Name,
            Email,
            Mobile,
            Password
        } = req.body;

        // Check existing user
        const existingUser =
            await User.findOne({

                email: Email

            });

        // User already exists
        if (existingUser) {

            return res.status(409).json({

                message: "User already Exists"

            });

        }

        // Create new user
        const user = new User({

            name: Name,
            email: Email,
            mobile: Mobile,
            password: Password

        });

        // Save user
        await user.save();

        // Success response
        res.status(201).json({

            message: "Signup Successful"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server Error"

        });

    }

});


// ======================================
// LOGIN API
// ======================================

app.post("/login", async (req, res) => {

    try {

        // Get login data
        const {
            Email,
            Password
        } = req.body;

        console.log(req.body);

        // Find user by email
        const userValidation =
            await User.findOne({

                email: Email
 
            });

        // User not found
        if (!userValidation) {

            return res.status(404).json({

                message:
                    "Create an Account to Login"

            });

        }

        // Password validation
        if (
            userValidation.password !== Password
        ) {

            return res.status(401).json({

                message:
                    "Password Incorrect"

            });

        }

        // Login success
        res.status(200).json({

            message: "Login Successful"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Server Error"

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