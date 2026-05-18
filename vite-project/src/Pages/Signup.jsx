import { useState } from 'react';
import axios from 'axios';

import { Link, useNavigate } from 'react-router-dom';

import img from '../assets/SekuraLogo.png';
import bg_img from '../assets/image.png';

function Signup() {

    // =========================
    // NAVIGATE
    // =========================

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
        emailValid &&
        otp &&
        password &&
        reEnter &&
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
                'Enter the valid email address'
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

        if (password === '') {

            setPasswordError('');

        }

        else if (password.length < 8) {

            setPasswordError(
                'Password must contain minimum 8 characters'
            );

        }

        else {

            setPasswordError('');

        }

    };

    // =========================
    // RE-PASSWORD VALIDATION
    // =========================

    const validateRePassword = (
        rePassword,
        password
    ) => {

        if (rePassword === '') {

            setRePasswordError('');

        }

        else if (rePassword !== password) {

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
                'Name must contain more than 3 characters'
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

        try {

            const response =
                await axios.post(

                    "http://localhost:5000/send-otp",

                    {
                        Email: email
                    }

                );

            alert(response.data.message);

            setOtpSent(true);

        }

        catch (error) {

            if (error.response) {

                alert(
                    error.response.data.message
                );

            }

            else {

                alert("Server error");

            }

        }

    };

    // =========================
    // SIGNUP
    // =========================

    const handleSignup = async () => {

        try {

            // VERIFY OTP
            await axios.post(

                "http://localhost:5000/verify-otp",

                {
                    Email: email,
                    OTP: otp
                }

            );

            setOtpVerified(true);

            // CREATE ACCOUNT
            const response =
                await axios.post(

                    'http://localhost:5000/newUser',

                    {
                        Name: name,
                        Email: email, 
                        Password: password
                    }

                );

            // STORE JWT TOKEN
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

    // =========================
    // JSX
    // =========================

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

                    {/* LOGO */}

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

                    {/* FORM */}

                    <form className='flex flex-col items-center gap-4'>

                        {/* NAME */}
                        <div className='h-[60px] w-[450px] ml-24'>
                            <input
                                className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'
                                placeholder='Name'
                                value={name}
                                onChange={(e) => {

                                    setName(e.target.value);
                                    validateName(e.target.value);

                                }}
                                style={inputStyle}
                            />

                            {nameError && (

                                <p className='text-red-500 m-0'>
                                    {nameError}
                                </p>

                            )}
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
                                    validateEmail(e.target.value);

                                }}
                                style={inputStyle}
                            />

                            {emailError && (

                                <p className='text-red-500 m-0'>
                                    {emailError}
                                </p>

                            )}

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

                                    </div>

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

                                    setPassword(e.target.value);
                                    validatePassword(e.target.value);

                                }}
                                style={inputStyle}
                            />

                            {passwordError && (

                                <p className='text-red-500 m-0'>
                                    {passwordError}
                                </p>

                            )}
                        </div>

                        {/* RE-ENTER PASSWORD */}
                        <div className='h-[60px] w-[450px] ml-24'>
                            <input
                                type='password'
                                className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'
                                placeholder='Re-enter Password'
                                value={reEnter}
                                onChange={(e) => {

                                    setReEnter(e.target.value);

                                    validateRePassword(
                                        e.target.value,
                                        password
                                    );

                                }}
                                style={inputStyle}
                            />

                            {rePasswordError && (

                                <p className='text-red-500 m-0'>
                                    {rePasswordError}
                                </p>

                            )}
                        </div>

                        {/* SIGNUP BUTTON */}

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

                        {/* LOGIN LINK */}

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