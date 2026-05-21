import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import img from "../assets/SekuraLogo.png";

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
      await axios.post("http://localhost:5000/send-otp", {
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
      await axios.post("http://localhost:5000/verify-otp", {
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
      const response = await axios.post("http://localhost:5000/newUser", {
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
    "w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25";

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-2xl shadow-cyan-500/20">
            <img
              src={img}
              alt="Sekura Logo"
              className="h-12 w-12 object-contain"
            />
          </div>

          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            Create account
          </p>

          <h1 className="mt-4 text-3xl font-black text-white">
            Join Sekura
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Set up your encrypted workspace.
          </p>
        </div>

        <div className="space-y-5">
          <div>
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
              <p className="mt-2 text-sm text-red-300">{nameError}</p>
            )}
          </div>

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
              <p className="mt-2 text-sm text-red-300">{emailError}</p>
            )}
          </div>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            className={inputClass}
          />

          {passwordError && (
            <p className="text-sm text-red-300">{passwordError}</p>
          )}

          <input
            type="password"
            placeholder="Re-enter password"
            value={reEnter}
            onChange={(e) => {
              setReEnter(e.target.value);
              setRePasswordError("");
            }}
            className={inputClass}
          />

          {rePasswordError && (
            <p className="text-sm text-red-300">{rePasswordError}</p>
          )}

          {!otpSent && (
            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
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
                  <p className="mt-2 text-sm text-red-300">{otpError}</p>
                )}
              </div>

              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-300 py-3 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {otpVerified && (
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-3 text-center">
              <p className="font-medium text-emerald-200">
                Email Verified Successfully
              </p>
            </div>
          )}

          {otpVerified && (
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Signup"}
            </button>
          )}

          <p className="pt-2 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-cyan-200 no-underline transition hover:text-cyan-100"
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
