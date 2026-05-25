import crypto from "crypto";

// Generates a cryptographically secure six-digit numeric OTP.
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

export default generateOTP;
