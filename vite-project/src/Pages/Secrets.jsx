import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, KeyRound, Link2, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react";
import AddSecret from "../popup-page/addSecret";
import api from "../api";

function DeleteSecretDialog({ loading, onCancel, onConfirm, secret }) {
  if (!secret) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-red-300/20 bg-slate-950 p-6 shadow-2xl shadow-red-950/30">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-200">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-black text-white">
              Delete secret?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This will permanently delete{" "}
              <span className="font-semibold text-slate-100">
                {secret.title}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-11 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="min-h-11 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-xl shadow-red-500/20 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Secrets() {
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState([]);
  const [showSecretPopup, setShowSecretPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewedSecret, setViewedSecret] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [secretToDelete, setSecretToDelete] = useState(null);

  const fetchSecrets = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await api.get("/api/encrypted-secrets");

      setSecrets(response.data.secrets || []);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load secrets");
    } finally {
      setLoading(false);
    }
  };

  const addSecretToList = (secret) => {
    setSecrets((currentSecrets) => [secret, ...currentSecrets]);
  };

  const viewSecret = async (secretId) => {
    try {
      setError("");
      setActionLoading(secretId);

      const response = await api.get(
        `/api/encrypted-secrets/${secretId}/decrypt`
      );

      setViewedSecret(response.data.secret);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to decrypt secret");
    } finally {
      setActionLoading("");
    }
  };

  const deleteSecret = async () => {
    if (!secretToDelete) {
      return;
    }

    const secretId = secretToDelete._id || secretToDelete.id;

    try {
      setError("");
      setActionLoading(secretId);

      await api.delete(`/api/encrypted-secrets/${secretId}`);

      setSecrets((currentSecrets) =>
        currentSecrets.filter((secret) => (secret._id || secret.id) !== secretId)
      );

      if ((viewedSecret?._id || viewedSecret?.id) === secretId) {
        setViewedSecret(null);
      }

      setSecretToDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete secret");
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchSecrets, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative isolate min-h-full overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 md:px-8 lg:px-20">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

      {showSecretPopup && (
        <AddSecret
          closePopup={() => setShowSecretPopup(false)}
          onSecretCreated={addSecretToList}
        />
      )}

      <DeleteSecretDialog
        loading={Boolean(actionLoading)}
        onCancel={() => setSecretToDelete(null)}
        onConfirm={deleteSecret}
        secret={secretToDelete}
      />

      {viewedSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">
                {viewedSecret.title}
              </h2>

              <button
                onClick={() => setViewedSecret(null)}
                className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close decrypted secret"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-200">
              Decrypted Secret
            </label>

            <textarea
              readOnly
              value={viewedSecret.value}
              className="mt-2 min-h-[140px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none"
            />

            <button
              onClick={() => setViewedSecret(null)}
              className="mt-5 w-full rounded-xl bg-cyan-300 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between lg:p-7">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              Encrypted registry
            </p>

            <h1 className="mt-4 text-3xl font-black text-white md:text-5xl">
              Secrets Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              Securely manage, monitor, and rotate environment variables, API
              keys, certificates, and shared access links.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-white/[0.12]"
              onClick={() => setShowSecretPopup(true)}
            >
              <Plus className="h-4 w-4" />
              Add Secret
            </button>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01]"
              onClick={() => navigate("/create-link")}
            >
              <Link2 className="h-4 w-4" />
              Create Access Link
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search secrets by name, tags, or role..."
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 pl-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/25 backdrop-blur-2xl">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-black text-white">
              Credentials Registry
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Displaying active secrets in your workspace.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-4 border-b border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-100">
              <div className="p-4">Secret Name</div>
              <div className="p-4">Status</div>
              <div className="p-4">Last Updated</div>
              <div className="p-4 text-center">Actions</div>
            </div>

            {loading && (
              <div className="p-6 text-sm text-slate-400">
                Loading secrets...
              </div>
            )}

            {error && (
              <div className="p-6 text-sm font-medium text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && secrets.length === 0 && (
              <div className="p-6 text-sm text-slate-400">
                No secrets stored yet.
              </div>
            )}

            {!loading && !error && secrets.map((secret) => {
              const secretId = secret._id || secret.id;

              return (
                <div
                  key={secretId}
                  className="grid min-w-[760px] grid-cols-4 items-center border-b border-white/10 text-sm text-slate-300 transition last:border-b-0 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3 p-4 font-semibold text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    {secret.title}
                  </div>

                  <div className="p-4">
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                      Active
                    </span>
                  </div>

                  <div className="p-4">
                    {new Date(
                      secret.updatedAt || secret.createdAt
                    ).toLocaleString()}
                  </div>

                  <div className="flex justify-center gap-3 p-4">
                    <button
                      onClick={() => viewSecret(secretId)}
                      disabled={actionLoading === secretId}
                      className="inline-flex items-center gap-1 font-semibold text-cyan-200 transition hover:text-cyan-100 disabled:text-cyan-300/40"
                    >
                      <Eye className="h-4 w-4" />
                      {actionLoading === secretId ? "Loading" : "View"}
                    </button>

                    <button
                      onClick={() => setSecretToDelete(secret)}
                      disabled={actionLoading === secretId}
                      className="inline-flex items-center gap-1 font-semibold text-red-300 transition hover:text-red-200 disabled:text-red-300/40"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
