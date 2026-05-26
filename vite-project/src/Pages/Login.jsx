import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import api from "../api";
import img from "../assets/SekuraLogo.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtpVerified, setResetOtpVerified] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetRePassword, setResetRePassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoginFormValid = email && password && !emailError && !passwordError;
  const isResetFormValid =
    resetPassword && resetRePassword && resetPassword.length >= 8;

  const validateEmail = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const error =
      value === "" || emailPattern.test(value)
        ? ""
        : "Enter a valid email address";

    setEmailError(error);
    return !error && value !== "";
  };

  const validatePassword = (value) => {
    const error =
      value === "" || value.length >= 8
        ? ""
        : "Password must be at least 8 characters";

    setPasswordError(error);
    return !error && value !== "";
  };

  const resetForgotState = () => {
    setForgotMode(false);
    setResetOtp("");
    setResetOtpSent(false);
    setResetOtpVerified(false);
    setResetPassword("");
    setResetRePassword("");
    setResetMessage("");
    setResetError("");
  };

  const handleLogin = async () => {
    try {
      setLoginError("");
      setLoginMessage("");

      const response = await api.post("/login", {
        Email: email,
        Password: password,
      });

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setLoginError(error.response ? error.response.data.message : "Server error");
    }
  };

  const sendResetOtp = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      await api.post("/send-otp", {
        Email: email,
      });

      setResetOtpSent(true);
      setResetMessage("OTP sent to your email.");
    } catch (error) {
      setResetError(error.response ? error.response.data.message : "Server error");
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOtp = async () => {
    setLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      await api.post("/verify-otp", {
        Email: email,
        OTP: resetOtp,
      });

      setResetOtpVerified(true);
      setResetMessage("Email verified. Set a new password.");
    } catch (error) {
      setResetError(error.response ? error.response.data.message : "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      await api.post("/reset-password", {
        Email: email,
        Password: resetPassword,
        RePassword: resetRePassword,
      });

      resetForgotState();
      setPassword("");
      setPasswordError("");
      setLoginMessage("Password changed successfully. Login with your new password.");
    } catch (error) {
      setResetError(error.response ? error.response.data.message : "Server error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-inner shadow-slate-900/5 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/15 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-green-300/70 dark:focus:ring-green-400/25";

  const primaryButton =
    "group flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-white shadow-xl shadow-green-500/20 transition hover:scale-[1.01] hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gradient-to-r dark:from-green-300 dark:via-green-500 dark:to-emerald-300 dark:text-slate-950";

  return (
    <div className="sekura-auth-page relative isolate min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="sekura-auth-bg absolute -inset-8 -z-20" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:58px_58px] opacity-60 dark:bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] dark:opacity-40" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="hidden lg:block"
        >
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-200 bg-white shadow-xl shadow-green-900/5 dark:border-green-300/20 dark:bg-white/[0.06]">
                <img src={img} alt="Sekura Logo" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-green-700 dark:text-green-300">
                  Sekura
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Developer-first secret sharing
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-normal text-slate-950 dark:text-white">
              Secure access for every secret workflow.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600 dark:text-slate-300">
              Keep credentials, request links, and encrypted handoffs in a calm workspace built for engineering teams.
            </p>

            <div className="mt-8 grid gap-3">
              {["Zero-knowledge sharing model", "Short-lived access links", "Clean audit-friendly workspace"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-300">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08] dark:shadow-2xl dark:shadow-black/30 sm:p-8"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-200 bg-green-50 shadow-xl shadow-green-900/5 dark:border-green-300/30 dark:bg-green-300/10 dark:shadow-green-500/20">
              <img src={img} alt="Sekura Logo" className="h-12 w-12 object-contain" />
            </div>

            <p className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-green-700 dark:border-green-300/20 dark:bg-green-300/10 dark:text-green-100">
              <ShieldCheck className="h-4 w-4" />
              {forgotMode ? "Password recovery" : "Secure access"}
            </p>

            <h1 className="mt-4 text-3xl font-black text-slate-950 dark:text-white">
              {forgotMode ? "Reset password" : "Welcome to Sekura"}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {forgotMode
                ? "Verify your email before changing your password."
                : "Sign in to manage encrypted secrets and secure links."}
            </p>
          </div>

          {!forgotMode ? (
            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    className={`${inputClass} pl-12 ${emailError ? "border-red-300/60" : ""}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                  />
                </div>
                {emailError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{emailError}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    className={`${inputClass} pl-12 ${passwordError ? "border-red-300/60" : ""}`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                  />
                </div>
                {passwordError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{passwordError}</p>}

                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setLoginError("");
                    setLoginMessage("");
                  }}
                  className="mt-3 text-sm font-semibold text-green-700 transition hover:text-green-800 dark:text-green-200 dark:hover:text-green-100"
                >
                  Forgot password?
                </button>
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-300/25 dark:bg-red-500/10 dark:text-red-200">
                  {loginError}
                </div>
              )}

              {loginMessage && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-emerald-300/25 dark:bg-emerald-300/10 dark:text-emerald-200">
                  {loginMessage}
                </div>
              )}

              <button
                type="button"
                className={primaryButton}
                disabled={!isLoginFormValid}
                onClick={handleLogin}
              >
                Login
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-semibold text-green-700 no-underline transition hover:text-green-800 dark:text-green-200 dark:hover:text-green-100">
                  Create Account
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Verified Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    className={`${inputClass} pl-12 ${emailError ? "border-red-300/60" : ""}`}
                    placeholder="you@example.com"
                    value={email}
                    disabled={resetOtpVerified}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setResetOtpSent(false);
                      setResetMessage("");
                      setResetError("");
                      validateEmail(e.target.value);
                    }}
                  />
                </div>
                {emailError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{emailError}</p>}
              </div>

              {!resetOtpSent && (
                <button type="button" onClick={sendResetOtp} disabled={loading} className={primaryButton}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              )}

              {resetOtpSent && !resetOtpVerified && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={resetOtp}
                    onChange={(e) => {
                      setResetOtp(e.target.value);
                      setResetError("");
                    }}
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={verifyResetOtp}
                    disabled={loading || resetOtp.length !== 6}
                    className="w-full rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-300 dark:text-slate-950 dark:hover:bg-emerald-200"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              )}

              {resetOtpVerified && (
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="New password"
                    value={resetPassword}
                    onChange={(e) => {
                      setResetPassword(e.target.value);
                      setResetError("");
                    }}
                    className={inputClass}
                  />

                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={resetRePassword}
                    onChange={(e) => {
                      setResetRePassword(e.target.value);
                      setResetError("");
                    }}
                    className={inputClass}
                  />

                  <button type="button" onClick={handleResetPassword} disabled={loading || !isResetFormValid} className={primaryButton}>
                    {loading ? "Changing Password..." : "Change Password"}
                  </button>
                </div>
              )}

              {resetMessage && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-emerald-300/25 dark:bg-emerald-300/10 dark:text-emerald-200">
                  {resetMessage}
                </div>
              )}

              {resetError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-300/25 dark:bg-red-500/10 dark:text-red-200">
                  {resetError}
                </div>
              )}

              <button type="button" onClick={resetForgotState} className="w-full text-sm font-semibold text-green-700 transition hover:text-green-800 dark:text-green-200 dark:hover:text-green-100">
                Back to login
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
