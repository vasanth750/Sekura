import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function RequestPage() {
  const [secretValue, setSecretValue] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.13),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-cyan-300/10 p-7 text-white md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-cyan-100">
              <ShieldCheck size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                Sekura Secret Request
              </h1>

              <p className="mt-1 text-sm text-slate-400 md:text-base">
                Safely share confidential credentials using encrypted transmission.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">
                  Requested Secret
                </label>

                <input
                  type="text"
                  value="Production Database Password"
                  disabled
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 font-medium text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">
                  Enter Secret
                </label>

                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter the requested secret"
                    value={secretValue}
                    onChange={(e) => {
                      setSecretValue(e.target.value);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 pr-14 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
                  />

                  <button
                    type="button"
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-cyan-100"
                    onClick={() => setShowSecret((current) => !current)}
                    aria-label={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? (
                      <EyeOff size={22} />
                    ) : (
                      <Eye size={22} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">
                  Notes (Optional)
                </label>

                <textarea
                  rows="4"
                  placeholder="Add any additional information..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-4 text-lg font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01]"
              >
                Submit Secret Securely
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10">
                <ShieldCheck size={40} className="text-emerald-200" />
              </div>

              <h2 className="text-3xl font-black text-white">
                Secret Submitted
              </h2>

              <p className="mt-3 max-w-md text-slate-400">
                Your confidential secret has been securely transmitted successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
