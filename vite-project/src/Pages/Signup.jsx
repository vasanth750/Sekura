import { useState } from 'react';
import axios from 'axios';

import { Link, useNavigate } from 'react-router-dom';

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

    const [emailValid, setEmailValid] = useState(false);

    const [otp, setOtp] = useState("");

    const [otpSent, setOtpSent] = useState(false);

    const [otpVerified, setOtpVerified] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [rePasswordError, setRePasswordError] = useState("");
    const [nameError, setNameError] = useState("");

    // =========================
    // FORM VALIDATION
    // =========================

    const isFormValid =
        name &&
        email &&
        password &&
        reEnter &&
        otpVerified &&
        !nameError &&
        !emailError &&
        !passwordError &&
        !rePasswordError;

    // =========================
    // STYLES
    // =========================

    const inputStyle = {
        width: '80%',
        background: 'rgba(213, 229, 231, 0.96)',
        backdropFilter: 'blur(10px)'
    };

    // =========================
    // EMAIL VALIDATION
    // =========================

    const validateEmail = (email) => {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email === '') {

            setEmailError('');
            setEmailValid(false);

        }

        else if (!emailPattern.test(email)) {

            setEmailError(
                'Enter valid email address'
            );

            setEmailValid(false);

        }

        else {

            setEmailError('');
            setEmailValid(true);

        }

    };

    // =========================
    // PASSWORD VALIDATION
    // =========================

    const validatePassword = (password) => {

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (password === '') {

            setPasswordError('');

        }

        else if (
            !passwordPattern.test(password)
        ) {

            setPasswordError(
                'Password must contain uppercase, lowercase, number and special character'
            );

        }

        else {

            setPasswordError('');

        }

    };

    // =========================
    // RE PASSWORD VALIDATION
    // =========================

    const validateRePassword = (
        rePassword,
        password
    ) => {

        if (rePassword === '') {

            setRePasswordError('');

        }

        else if (
            rePassword !== password
        ) {

            setRePasswordError(
                "Password doesn't match"
            );

        }

        else {

            setRePasswordError('');

        }

    };

    // =========================
    // NAME VALIDATION
    // =========================

    const validateName = (name) => {

        if (name === '') {

            setNameError('');

        }

        else if (name.length < 3) {

            setNameError(
                'Name must contain minimum 3 characters'
            );

        }

        else {

            setNameError('');

        }

    };

    // =========================
    // SEND OTP
    // =========================

    const sendOTP = async () => {

        setOtpSent(true);

        try {

            await axios.post(

                "http://localhost:5000/send-otp",

                {
                    Email: email
                }

            );

        }

        catch (error) {

            if (error.response) {

                alert(
                    error.response.data.message
                );

            }

            else {

                alert("Server Error");

            }

        }

    };

    // =========================
    // VERIFY OTP
    // =========================

    const verifyOTP = async () => {

        try {

            await axios.post(

                "http://localhost:5000/verify-otp",

                {
                    Email: email,
                    OTP: otp
                }

            );

            setOtpVerified(true);

        }

        catch (error) {

            if (error.response) {

                alert(
                    error.response.data.message
                );

            }

            else {

                alert("Server Error");

            }

        }

    };

    // =========================
    // SIGNUP
    // =========================

    const handleSignup = async () => {

        try {

            const response =
                await axios.post(

                    "http://localhost:5000/newUser",

                    {
                        Name: name,
                        Email: email,
                        Password: password
                    }

                );

            localStorage.setItem(

                "token",
                response.data.token

            );

            alert(response.data.message);

            navigate("/dashboard");

        }

        catch (error) {

            if (error.response) {

                alert(
                    error.response.data.message
                );

            }

            else {

                alert("Server Error");

            }

        }

    };

    return (

        <>
            <div
                className='flex justify-center items-center min-h-screen py-5'
                style={{
                    backgroundImage: `url(${bg_img})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}
            >

                <div
                    className='mt-4 shadow-lg rounded-2xl p-4 relative bg-transparent'
                    style={{
                        width: '500px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >

                    <div className='text-center mb-4'>

                        <h2 className='text-white font-bold mt-2 flex items-center justify-center gap-2'>

                            <img
                                src={img}
                                alt='Sekura Logo'
                                style={{
                                    width: '55px',
                                    height: '55px',
                                    objectFit: 'contain'
                                }}
                            />

                            Sekura

                        </h2>

                    </div>

                    <form className='flex flex-col items-center gap-4'>

                        {/* NAME */}

                        <div className='h-[60px] w-[450px] ml-24'>

                            <input
                                className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'
                                placeholder='Name'
                                value={name}
                                onChange={(e) => {

                                    setName(e.target.value);

                                    validateName(
                                        e.target.value
                                    );

                                }}
                                style={inputStyle}
                            />

                            {
                                nameError && (

                                    <p className='text-red-500 m-0'>
                                        {nameError}
                                    </p>

                                )
                            }

                        </div>

                        {/* EMAIL */}

                        <div className='w-[450px] ml-24'>

                            <input
                                type='email'
                                className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'
                                placeholder='sample123@gmail.com'
                                value={email}
                                onChange={(e) => {

                                    setEmail(e.target.value);

                                    validateEmail(
                                        e.target.value
                                    );

                                }}
                                style={inputStyle}
                            />

                            {
                                emailError && (

                                    <p className='text-red-500 m-0'>
                                        {emailError}
                                    </p>

                                )
                            }

                            {
                                emailValid &&
                                !otpSent && (

                                    <button
                                        type='button'
                                        onClick={sendOTP}
                                        className='bg-cyan-500 text-white px-4 py-2 rounded mt-2'
                                    >

                                        Send OTP

                                    </button>

                                )
                            }

                            {
                                otpSent &&
                                !otpVerified && (

                                    <div className='mt-2'>

                                        <input

                                            type='text'

                                            placeholder='Enter OTP'

                                            value={otp}

                                            onChange={(e) =>
                                                setOtp(e.target.value)
                                            }

                                            className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'

                                            style={inputStyle}

                                        />

                                        <button
                                            type='button'
                                            onClick={verifyOTP}
                                            className='bg-green-500 text-white px-4 py-2 rounded mt-2'
                                        >

                                            Verify OTP

                                        </button>

                                    </div>

                                )
                            }

                            {
                                otpVerified && (

                                    <p className='text-green-400 mt-2'>

                                        Email Verified Successfully

                                    </p>

                                )
                            }

                        </div>

                        {/* PASSWORD */}

                        <div className='h-[60px] w-[450px] ml-24'>

                            <input
                                type='password'
                                className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'
                                placeholder='Password'
                                value={password}
                                onChange={(e) => {

                                    setPassword(
                                        e.target.value
                                    );

                                    validatePassword(
                                        e.target.value
                                    );

                                }}
                                style={inputStyle}
                            />

                            {
                                passwordError && (

                                    <p className='text-red-500 m-0'>
                                        {passwordError}
                                    </p>

                                )
                            }

                        </div>

                        {/* RE PASSWORD */}

                        <div className='h-[60px] w-[450px] ml-24'>

                            <input
                                type='password'
                                className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'
                                placeholder='Re-enter Password'
                                value={reEnter}
                                onChange={(e) => {

                                    setReEnter(
                                        e.target.value
                                    );

                                    validateRePassword(

                                        e.target.value,

                                        password

                                    );

                                }}
                                style={inputStyle}
                            />

                            {
                                rePasswordError && (

                                    <p className='text-red-500 m-0'>
                                        {rePasswordError}
                                    </p>

                                )
                            }

                        </div>

                        {/* SIGNUP */}

                        {
                            otpVerified && (

                                <button
                                    type='button'
                                    className={`
                                        rounded w-[300px] py-2 font-semibold text-white transition-colors
                                        ${isFormValid
                                            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                            : 'bg-gray-500 cursor-not-allowed'}
                                    `}
                                    disabled={!isFormValid}
                                    onClick={handleSignup}
                                >

                                    Signup

                                </button>

                            )
                        }

                        <p className='text-white'>

                            I Have Account?{" "}

                            <Link
                                to="/login"
                                className='text-cyan-400 no-underline font-semibold'
                            >

                                Login to Account

                            </Link>

                        </p>

                    </form>

                </div>

            </div>

        </>

    );
}

export default Signup;