import { useState } from "react";
import { CheckCircle2, Copy, Link2, ShieldCheck } from "lucide-react";

export default function CreateRequestPage() {
  const [requestName, setRequestName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = () => {
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/request/${uniqueId}`;

    setGeneratedLink(link);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative isolate flex min-h-full items-center justify-center overflow-hidden bg-slate-950 p-4 text-slate-100 md:p-8">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.13),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-cyan-300/10 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-cyan-100">
              <Link2 size={32} />
            </div>

            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                Protected collection
              </p>

              <h1 className="text-2xl font-black text-white md:text-3xl">
                Create Request Link
              </h1>

              <p className="mt-1 text-sm text-slate-400 md:text-base">
                Generate secure request links for collecting secrets safely.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-100">
                What is this request for?
              </label>

              <input
                type="text"
                placeholder="Example: Production Database Password"
                value={requestName}
                onChange={(e) => {
                  setRequestName(e.target.value);
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
              />
            </div>

            <button
              onClick={handleGenerateLink}
              disabled={!requestName}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-4 text-lg font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate Request Link
            </button>

            {generatedLink && (
              <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-emerald-200" />
                  <h2 className="text-lg font-bold text-white">
                    Request Link Generated
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 font-mono text-xs text-slate-200 outline-none"
                  />

                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-100 sm:min-w-[140px]"
                  >
                    <Copy size={18} />
                    {copied ? "Copied" : "Copy Link"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
