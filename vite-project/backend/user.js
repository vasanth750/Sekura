import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {

        name: {

            type: String,

            required: true,

            trim: true

        },

        email: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true,

            index: true

        },

        password: {

            type: String,

            required: true

        },

        isVerified: {

            type: Boolean,

            default: false

        },

        verificationCode: {

            type: String

        },

        verificationCodeExpires: {

            type: Date

        },

        security: {

            encryptionKeyVersion: {

                type: Number,

                default: 1

            },

            lastLoginAt: {

                type: Date

            }

        }

    },
    {
        timestamps: true
    }
);

const User = mongoose.model(

    "User",

    userSchema

);

export default User;
