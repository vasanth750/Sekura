import { useState } from 'react';
import axios from 'axios';

import { Link } from 'react-router-dom';

import img from '../assets/SekuraLogo.png';
import bg_img from '../assets/image.png';

function Signup() {

    // =========================
    // STATES
    // =========================

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [reEnter, setReEnter] = useState("");

    const [emailError, setEmailError] = useState("");
    const [mobileErr, setMobileErr] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [rePasswordError, setRePasswordError] = useState("");
    const [nameError, setNameError] = useState("");

    // =========================
    // FORM VALIDATION
    // =========================

    const isFormValid =
        name &&
        email &&
        mobile &&
        password &&
        reEnter &&
        !nameError &&
        !emailError &&
        !mobileErr &&
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

        }

        else if (!emailPattern.test(email)) {

            setEmailError(
                'Enter the valid email address'
            );

        }

        else {

            setEmailError('');

        }

    };

    // =========================
    // MOBILE VALIDATION
    // =========================

    const mobileError = (mobile) => {

        if (mobile === '') {

            setMobileErr('');

        }

        else if (mobile.length < 10) {

            setMobileErr(
                'Enter 10 digit mobile number'
            );

        }

        else {

            setMobileErr('');

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

    const handleSignup = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5000/newUser',

                {
                    Name: name,
                    Email: email,
                    Mobile: mobile,
                    Password: password
                }

            );

            console.log(response.data.user);

            alert(response.data.message);

        }

        catch (error) {
            if (error.response) {
                alert(error.response.data.message);
            }
            else {
                alert("Server error");
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
                        <div className='h-[60px] w-[450px] ml-24'>
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
                        </div>
                        {/* MOBILE */}
                        <div className='h-[60px] w-[450px] ml-24'>
                            <input
                                type='text'
                                className='rounded-2xl shadow-sm border-2 border-gray-300 p-2 outline-none'
                                placeholder='91+ 0000000000'
                                value={mobile}
                                maxLength={10}
                                onChange={(e) => {

                                    const numberOnly =
                                        e.target.value.replace(/\D/g, '');

                                    setMobile(numberOnly);

                                    mobileError(numberOnly);

                                }}
                                style={inputStyle}
                            />

                            {mobileErr && (

                                <p className='text-red-500 m-0'>
                                    {mobileErr}
                                </p>

                            )}
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
                                to="/"
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