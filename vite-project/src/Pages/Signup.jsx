import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import img from "../assets/SekuraLogo.png";
import api from "../api";

function Signup() {
  const navigate = useNavigate();

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

  const validateEmail = (emailValue) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      setEmailError("Enter valid email address");
      return false;
    }

    setEmailError("");
    return true;
  };

  const sendOTP = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      await api.post("/send-otp", {
        Email: email,
      });

      setOtpSent(true);
    } catch (error) {
      if (error.response) {
        setEmailError(error.response.data.message);
      } else {
        setEmailError("Server Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);

    try {
      await api.post("/verify-otp", {
        Email: email,
        OTP: otp,
      });

      setOtpVerified(true);
      setOtpError("");
    } catch (error) {
      if (error.response) {
        setOtpError(error.response.data.message);
      } else {
        setOtpError("Server Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setNameError("");
    setPasswordError("");
    setRePasswordError("");

    try {
      const response = await api.post("/newUser", {
        Name: name,
        Email: email,
        Password: password,
        RePassword: reEnter,
      });

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;

        if (message.includes("Name")) {
          setNameError(message);
        } else if (message.includes("match")) {
          setRePasswordError(message);
        } else if (message.includes("Password")) {
          setPasswordError(message);
        }
      }
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
                  Encrypted onboarding
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-normal text-slate-950 dark:text-white">
              Start sharing secrets with verified access.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600 dark:text-slate-300">
              Create your workspace, verify your email, and keep sensitive handoffs protected from the first login.
            </p>

            <div className="mt-8 grid gap-3">
              {["Email OTP verification", "Encrypted secret workspace", "Protected request flows"].map((item) => (
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
              Create account
            </p>

            <h1 className="mt-4 text-3xl font-black text-slate-950 dark:text-white">
              Join Sekura
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Set up your encrypted workspace.
            </p>
          </div>

          <form className="space-y-5">
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                className={`${inputClass} pl-12`}
              />
            </div>

            {nameError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">{nameError}</p>
            )}

          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className={`${inputClass} pl-12`}
              />
            </div>

            {emailError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-300">{emailError}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                className={`${inputClass} pl-12`}
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-sm text-red-600 dark:text-red-300">{passwordError}</p>
          )}

          <div>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="Re-enter password"
                value={reEnter}
                onChange={(e) => {
                  setReEnter(e.target.value);
                  setRePasswordError("");
                }}
                className={`${inputClass} pl-12`}
              />
            </div>
          </div>

          {rePasswordError && (
            <p className="text-sm text-red-600 dark:text-red-300">{rePasswordError}</p>
          )}

          {!otpSent && (
            <button
              type="button"
              onClick={sendOTP}
              disabled={loading}
              className={primaryButton}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
              {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
            </button>
          )}

          {otpSent && !otpVerified && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError("");
                  }}
                  className={inputClass}
                />

                {otpError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-300">{otpError}</p>
                )}
              </div>

              <button
                type="button"
                onClick={verifyOTP}
                disabled={loading}
                className={primaryButton}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {otpVerified && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-emerald-300/25 dark:bg-emerald-300/10">
              <p className="font-medium text-green-700 dark:text-emerald-200">
                Email Verified Successfully
              </p>
            </div>
          )}

          {otpVerified && (
            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className={primaryButton}
            >
              {loading ? "Creating Account..." : "Signup"}
              {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
            </button>
          )}

          <p className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-green-700 no-underline transition hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
            >
              Login
            </Link>
          </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
