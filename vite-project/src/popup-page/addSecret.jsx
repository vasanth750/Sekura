import { useState } from "react";
import { Eye, EyeOff, FileText, LockKeyhole, X } from "lucide-react";
import api from "../api";

export default function AddSecret({ closePopup, onSecretCreated }) {
  const [secretName, setSecretName] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveSecret = async () => {
    try {
      setError("");

      if (!secretName.trim() || !secretValue.trim()) {
        setError("Secret name and value are required");
        return;
      }

      setLoading(true);

      const response = await api.post("/api/encrypted-secrets", {
        title: secretName,
        value: secretValue,
        type: "secret",
      });

      onSecretCreated(response.data.secret);
      closePopup();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to save secret");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-black text-white">
              Add Secret
            </h2>
          </div>

          <button
            onClick={closePopup}
            className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close add secret"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-200">
            Secret Name
          </label>

          <input
            type="text"
            placeholder="Enter Secret Name"
            value={secretName}
            onChange={(e) => {
              setSecretName(e.target.value);
            }}
            className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
          />

          <label className="mt-3 text-sm font-semibold text-slate-200">
            Secret
          </label>

          <div className="relative">
            <textarea
              rows={8}
              placeholder="Paste API keys, certificates, JSON, notes, or any multi-line secret..."
              value={secretValue}
              spellCheck={false}
              onChange={(e) => {
                setSecretValue(e.target.value);
              }}
              className={`min-h-48 w-full resize-y rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 pr-14 font-mono text-sm leading-6 text-white outline-none transition placeholder:font-sans placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25 ${showSecret ? "" : "[-webkit-text-security:disc]"}`}
            />

            <button
              type="button"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-cyan-100"
              onClick={() => setShowSecret((current) => !current)}
              aria-label={showSecret ? "Hide secret" : "Show secret"}
            >
              {showSecret ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 font-semibold text-cyan-100">
              <FileText className="h-4 w-4" />
              Multi-line secrets supported
            </span>
            <span>{secretValue.length.toLocaleString()} characters</span>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={saveSecret}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Secret"}
        </button>
      </div>
    </div>
  );
}
