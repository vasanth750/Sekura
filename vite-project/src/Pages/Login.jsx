import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import img from '../assets/SekuraLogo.png';
import bg_img from '../assets/image.png';

function Login() {

    // States
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Form Validation
    const isFormValid =
        email &&
        password &&
        !emailError &&
        !passwordError;

    // Email Validation
    const validateEmail = (value) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        setEmailError(
            value === '' || emailPattern.test(value)
                ? ''
                : 'Enter a valid email address'
        );
    };

    // Password Validation
    const validatePassword = (value) => {
        setPasswordError(
            value === '' || value.length >= 8
                ? ''
                : 'Password must be at least 8 characters'
        );
    };

    // Common Input Style
    const inputStyle = {
        width: '80%',
        background: 'rgba(213, 229, 231, 0.96)',
        backdropFilter: 'blur(10px)'
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(

                'http://localhost:5000/login',

                {
                    Email: email,
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

    return (
        <div
            className='flex justify-center items-center h-screen'
            style={{
                backgroundImage: `url(${bg_img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'repeat'
            }}
        >

            {/* Login Card */}
            <div
                className='container shadow-lg rounded-2xl p-4 bg-transparent'
                style={{
                    width: '500px',
                    height: '60vh',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >

                {/* Logo */}
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

                {/* Form */}
                <form className='flex flex-col items-center gap-3'>
                    <div className='h-[70px] w-[450px] ml-24'>
                        {/* Email Input */}
                        <input
                            type='email'
                            className={`rounded-2xl shadow-sm border-2 p-3 w-full outline-none
                            ${emailError ? 'border-red-500' : 'border-green-500'}`}
                            placeholder='Email'
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e.target.value);
                            }}
                            style={inputStyle}
                        />

                        {/* Email Messages */}
                        {emailError && (
                            <p className='text-red-500'>
                                {emailError}
                            </p>
                        )}
                    </div>


                    <div className='h-[70px] w-[450px] ml-24'>
                        {/* Password Input */}
                        <input
                            type='password'
                            className={`rounded-2xl shadow-sm border-2 p-3 w-full outline-none
                            ${passwordError ? 'border-red-500' : 'border-green-500'}`}
                            placeholder='Password'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                validatePassword(e.target.value);
                            }}
                            style={inputStyle}
                        />

                        {/* Password Error */}
                        {passwordError && (
                            <p className='text-red-500'>
                                {passwordError}
                            </p>
                        )}
                    </div>

                    {/* Login Button */}
                    <button
                        type='button'
                        className={`rounded w-[300px] py-2 font-semibold text-white transition-colors
                            ${isFormValid
                                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                : 'bg-gray-500 cursor-not-allowed'}`}
                        disabled={!isFormValid}
                        onClick={handleLogin}
                    >
                        LOGIN
                    </button>

                    {/* Signup Link */}
                    <div className='text-center mt-2'>

                        <span className='text-white me-2'>
                            Don't have an account?{' '}
                        </span>

                        <Link
                            to='/Signup'
                            className='text-cyan-400 no-underline font-semibold'
                        >
                            Create Account
                        </Link>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default Login;