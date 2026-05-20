import { useState } from 'react';
import axios from 'axios';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import img from '../assets/SekuraLogo.png';
import bg_img from '../assets/image.png';

function Signup() {

    const navigate = useNavigate();

    // =========================
    // STATES
    // =========================

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [reEnter, setReEnter] = useState("");
    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [nameError, setNameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [rePasswordError, setRePasswordError] = useState("");
    const [otpError, setOtpError] = useState("");

    // =========================
    // EMAIL VALIDATION
    // =========================

    const validateEmail = (email) => {

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            setEmailError("Enter valid email address");

            return false;

        }

        setEmailError("");

        return true;

    };

    // =========================
    // SEND OTP
    // =========================

    const sendOTP = async () => {

        if (!validateEmail(email)) {

            return;

        }

        setLoading(true);

        try {

            await axios.post(

                "http://localhost:5000/send-otp",

                {
                    Email: email
                }

            );

            setOtpSent(true);

        }

        catch (error) {

            if (error.response) {

                setEmailError(error.response.data.message);

            }

            else {

                setEmailError("Server Error");

            }

        }

        finally {

            setLoading(false);

        }

    };

    // =========================
    // VERIFY OTP
    // =========================

    const verifyOTP = async () => {

        setLoading(true);

        try {

            await axios.post(

                "http://localhost:5000/verify-otp",

                {
                    Email: email,
                    OTP: otp
                }

            );

            setOtpVerified(true);

            setOtpError("");

        }

        catch (error) {

            if (error.response) {

                setOtpError(error.response.data.message);

            }

            else {

                setOtpError("Server Error");

            }

        }

        finally {

            setLoading(false);

        }

    };

    // =========================
    // SIGNUP
    // =========================

    const handleSignup = async () => {

        setLoading(true);

        setNameError("");
        setPasswordError("");
        setRePasswordError("");

        try {

            const response = await axios.post(

                "http://localhost:5000/newUser",

                {
                    Name: name,
                    Email: email,
                    Password: password,
                    RePassword: reEnter
                }

            );

            // =========================
            // STORE TOKEN
            // =========================

            sessionStorage.setItem(
                "token",
                response.data.token
            );

            // =========================
            // STORE USER
            // =========================

            sessionStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard", { replace: true });

        }

        catch (error) {

            if (error.response) {

                const message =
                    error.response.data.message;

                if (message.includes("Name")) {

                    setNameError(message);

                }

                else if (
                    message.includes("match")
                ) {

                    setRePasswordError(message);

                }

                else if (
                    message.includes("Password")
                ) {

                    setPasswordError(message);

                }

            }

        }

        finally {

            setLoading(false);

        }

    };

    // =========================
    // JSX
    // =========================

    return (

        <div

            className='min-h-screen flex items-center justify-center px-4'

            style={{

                backgroundImage: `url(${bg_img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'

            }}

        >

            <div

                className='w-full max-w-md rounded-3xl p-8 shadow-2xl'

                style={{

                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.2)'

                }}

            >

                {/* LOGO */}

                <div className='flex flex-col items-center mb-8'>

                    <img

                        src={img}

                        alt='Sekura Logo'

                        className='w-16 h-16 object-contain mb-2'

                    />

                    <h1 className='text-white text-3xl font-bold'>

                        Sekura

                    </h1>

                    <p className='text-gray-200 text-sm mt-1'>

                        Secure Your Account

                    </p>

                </div>

                {/* FORM */}

                <div className='space-y-5'>

                    {/* NAME */}

                    <div>

                        <input

                            type='text'

                            placeholder='Enter your name'

                            value={name}

                            onChange={(e) => {

                                setName(e.target.value);

                                setNameError("");

                            }}

                            className='w-full rounded-xl p-3 outline-none border border-gray-300 bg-white/90'

                        />

                        {

                            nameError && (

                                <p className='text-red-400 text-sm mt-1'>

                                    {nameError}

                                </p>

                            )

                        }

                    </div>

                    {/* EMAIL */}

                    <div>

                        <input

                            type='email'

                            placeholder='Enter your email'

                            value={email}

                            onChange={(e) => {

                                setEmail(e.target.value);

                                setEmailError("");

                            }}

                            className='w-full rounded-xl p-3 outline-none border border-gray-300 bg-white/90'

                        />

                        {

                            emailError && (

                                <p className='text-red-400 text-sm mt-1'>

                                    {emailError}

                                </p>

                            )

                        }

                    </div>

                    {/* PASSWORD */}

                    <div>

                        <input

                            type='password'

                            placeholder='Enter password'

                            value={password}

                            onChange={(e) => {

                                setPassword(e.target.value);

                                setPasswordError("");

                            }}

                            className='w-full rounded-xl p-3 outline-none border border-gray-300 bg-white/90'

                        />

                        {

                            passwordError && (

                                <p className='text-red-400 text-sm mt-1'>

                                    {passwordError}

                                </p>

                            )

                        }

                    </div>

                    {/* RE PASSWORD */}

                    <div>

                        <input

                            type='password'

                            placeholder='Re-enter password'

                            value={reEnter}

                            onChange={(e) => {

                                setReEnter(e.target.value);

                                setRePasswordError("");

                            }}

                            className='w-full rounded-xl p-3 outline-none border border-gray-300 bg-white/90'

                        />

                        {

                            rePasswordError && (

                                <p className='text-red-400 text-sm mt-1'>

                                    {rePasswordError}

                                </p>

                            )

                        }

                    </div>

                    {/* SEND OTP */}

                    {

                        !otpSent && (

                            <button

                                onClick={sendOTP}

                                disabled={loading}

                                className='w-full bg-cyan-500 hover:bg-cyan-600 transition-all text-white font-semibold py-3 rounded-xl'

                            >

                                {

                                    loading
                                        ? "Sending OTP..."
                                        : "Send OTP"

                                }

                            </button>

                        )

                    }

                    {/* OTP SECTION */}

                    {

                        otpSent &&
                        !otpVerified && (

                            <div className='space-y-4'>

                                <div>

                                    <input

                                        type='text'

                                        placeholder='Enter OTP'

                                        value={otp}

                                        onChange={(e) => {

                                            setOtp(e.target.value);

                                            setOtpError("");

                                        }}

                                        className='w-full rounded-xl p-3 outline-none border border-gray-300 bg-white/90'

                                    />

                                    {

                                        otpError && (

                                            <p className='text-red-400 text-sm mt-1'>

                                                {otpError}

                                            </p>

                                        )

                                    }

                                </div>

                                <button

                                    onClick={verifyOTP}

                                    disabled={loading}

                                    className='w-full bg-green-500 hover:bg-green-600 transition-all text-white font-semibold py-3 rounded-xl'

                                >

                                    {

                                        loading
                                            ? "Verifying..."
                                            : "Verify OTP"

                                    }

                                </button>

                            </div>

                        )

                    }

                    {/* VERIFIED */}

                    {

                        otpVerified && (

                            <div className='bg-green-500/20 border border-green-400 rounded-xl p-3 text-center'>

                                <p className='text-green-300 font-medium'>

                                    Email Verified Successfully

                                </p>

                            </div>

                        )

                    }

                    {/* SIGNUP */}

                    {

                        otpVerified && (

                            <button

                                onClick={handleSignup}

                                disabled={loading}

                                className='w-full bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold py-3 rounded-xl'

                            >

                                {

                                    loading
                                        ? "Creating Account..."
                                        : "Signup"

                                }

                            </button>

                        )

                    }

                    {/* LOGIN */}

                    <p className='text-center text-gray-200 text-sm pt-2'>

                        Already have an account?{" "}

                        <Link

                            to="/login"

                            className='text-cyan-300 font-semibold no-underline'

                        >

                            Login

                        </Link>

                    </p>

                </div>

            </div>

        </div>

    );

}

export default Signup;