import { useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Link2, Loader2, ShieldCheck } from "lucide-react";
import api from "../api";

export default function CreateRequestPage() {
  const [requestName, setRequestName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateLink = async () => {
    try {
      setCreating(true);
      setError("");
      setGeneratedLink("");

      const response = await api.post("/api/secret-requests", {
        title: requestName,
      });
      const params = new URLSearchParams({
        type: "collect",
      });
      const link = `${window.location.origin}/request/${response.data.request.id}?${params.toString()}`;

      setGeneratedLink(link);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to generate request link."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="sekura-page flex min-h-full items-center justify-center p-4 md:p-8">
      <div className="sekura-panel w-full max-w-3xl overflow-hidden rounded-xl">
        <div className="border-b border-green-200 bg-green-50 p-6 dark:border-green-400/20 dark:bg-green-400/10 md:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-green-200 bg-white p-3 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
              <Link2 size={32} />
            </div>

            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-700 dark:text-green-300">
                <ShieldCheck className="h-4 w-4" />
                Protected collection
              </p>

              <h1 className="sekura-heading text-2xl font-black md:text-3xl">
                Create Request Link
              </h1>

              <p className="sekura-muted mt-1 text-sm md:text-base">
                Generate secure request links for collecting secrets safely.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="space-y-6">
            <div>
              <label className="sekura-heading mb-2 block text-sm font-semibold">
                What is this request for?
              </label>

              <input
                type="text"
                placeholder="Example: Production Database Password"
                value={requestName}
                onChange={(e) => {
                  setRequestName(e.target.value);
                  setError("");
                }}
                className="sekura-input w-full rounded-lg px-5 py-4 text-base outline-none transition"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-300/25 bg-red-500/10 p-4 text-red-100">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerateLink}
              disabled={!requestName.trim() || creating}
              className="sekura-primary-btn flex w-full items-center justify-center gap-2 rounded-lg py-4 text-lg font-bold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
              {creating ? "Generating..." : "Generate Request Link"}
            </button>

            {generatedLink && (
              <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-emerald-300/20 dark:bg-emerald-300/10">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-green-700 dark:text-emerald-200" />
                  <h2 className="sekura-heading text-lg font-bold">
                    Request Link Generated
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="sekura-input flex-1 rounded-lg px-4 py-3 font-mono text-xs outline-none"
                  />

                  <button
                    onClick={handleCopy}
                    className="sekura-secondary-btn flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold transition sm:min-w-[140px]"
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
