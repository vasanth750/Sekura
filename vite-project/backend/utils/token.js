import jwt from "jsonwebtoken";

// Creates the short-lived auth token returned after a successful OTP check.
export const generateToken = (payload) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
};
