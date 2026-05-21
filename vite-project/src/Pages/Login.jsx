import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import api from "../api";
import img from "../assets/SekuraLogo.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const isFormValid = email && password && !emailError && !passwordError;

  const validateEmail = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setEmailError(
      value === "" || emailPattern.test(value)
        ? ""
        : "Enter a valid email address"
    );
  };

  const validatePassword = (value) => {
    setPasswordError(
      value === "" || value.length >= 8
        ? ""
        : "Password must be at least 8 characters"
    );
  };

  const handleLogin = async () => {
    try {
      setLoginError("");

      const response = await api.post("/login", {
        Email: email,
        Password: password,
      });

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.response) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError("Server error");
      }
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-2xl shadow-cyan-500/20">
            <img
              src={img}
              alt="Sekura Logo"
              className="h-12 w-12 object-contain"
            />
          </div>

          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            Secure access
          </p>

          <h1 className="mt-4 text-3xl font-black text-white">
            Welcome to Sekura
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage encrypted secrets and secure links.
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-100">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                className={`w-full rounded-xl border bg-slate-950/50 px-4 py-3 pl-12 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400/25 ${
                  emailError ? "border-red-300/60" : "border-white/10 focus:border-cyan-300/70"
                }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
              />
            </div>

            {emailError && (
              <p className="mt-2 text-sm text-red-300">{emailError}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-100">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                className={`w-full rounded-xl border bg-slate-950/50 px-4 py-3 pl-12 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400/25 ${
                  passwordError ? "border-red-300/60" : "border-white/10 focus:border-cyan-300/70"
                }`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
              />
            </div>

          {passwordError && (
            <p className="mt-2 text-sm text-red-300">{passwordError}</p>
          )}
        </div>

          {loginError && (
            <div className="rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {loginError}
            </div>
          )}

          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isFormValid}
            onClick={handleLogin}
          >
            Login
          </button>

          <div className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-cyan-200 no-underline transition hover:text-cyan-100"
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
