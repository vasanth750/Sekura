import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, KeyRound, Link2, Plus, Search, ShieldCheck } from "lucide-react";
import AddSecret from "../popup-page/addSecret";
import api from "../api";
import {
  DeleteSecretDialog,
  EditSecretDialog,
  SecretActionButtons,
  SecretViewerDialog,
} from "../components/secrets/SecretDialogs";

const PAGE_SIZE = 8;

const getSecretSourceLabel = (secret) =>
  secret?.metadata?.source === "request" ? "Requested Secret" : "Your Secret";

export default function Secrets() {
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState([]);
  const [showSecretPopup, setShowSecretPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewedSecret, setViewedSecret] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [secretToDelete, setSecretToDelete] = useState(null);
  const [secretToEdit, setSecretToEdit] = useState(null);
  const [editError, setEditError] = useState("");
  const [secretPage, setSecretPage] = useState(0);

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
    setSecretPage(0);
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
      setSecretPage((page) =>
        Math.min(page, Math.max(0, Math.ceil((secrets.length - 1) / PAGE_SIZE) - 1))
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

  const editSecret = async (secretId) => {
    try {
      setError("");
      setEditError("");
      setActionLoading(secretId);

      const response = await api.get(
        `/api/encrypted-secrets/${secretId}/decrypt`
      );

      setSecretToEdit(response.data.secret);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load secret for editing");
    } finally {
      setActionLoading("");
    }
  };

  const saveEditedSecret = async ({ title, value }) => {
    if (!secretToEdit) {
      return;
    }

    const secretId = secretToEdit._id || secretToEdit.id;

    try {
      setEditError("");
      setActionLoading(secretId);

      const response = await api.put(`/api/encrypted-secrets/${secretId}`, {
        title,
        value,
        type: secretToEdit.type || "secret",
      });

      setSecrets((currentSecrets) =>
        currentSecrets.map((secret) =>
          (secret._id || secret.id) === secretId ? response.data.secret : secret
        )
      );

      if ((viewedSecret?._id || viewedSecret?.id) === secretId) {
        setViewedSecret(null);
      }

      setSecretToEdit(null);
    } catch (error) {
      setEditError(error.response?.data?.message || "Unable to update secret");
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchSecrets, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const secretPageCount = Math.max(1, Math.ceil(secrets.length / PAGE_SIZE));
  const pagedSecrets = secrets.slice(
    secretPage * PAGE_SIZE,
    secretPage * PAGE_SIZE + PAGE_SIZE
  );

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

      <SecretViewerDialog
        onClose={() => setViewedSecret(null)}
        secret={viewedSecret}
      />

      <EditSecretDialog
        error={editError}
        loading={Boolean(actionLoading)}
        onCancel={() => {
          setSecretToEdit(null);
          setEditError("");
        }}
        onSave={saveEditedSecret}
        secret={secretToEdit}
      />

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
              Your Secrets
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Displaying the most recently added secrets in your workspace.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-[1.35fr_0.9fr_1.2fr_1.2fr_1fr] items-center gap-4 border-b border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100">
              <div className="p-4">Secret Name</div>
              <div className="p-4 text-center">Type</div>
              <div className="p-4 text-center">Created</div>
              <div className="p-4 text-center">Updated</div>
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

            {!loading && !error && pagedSecrets.map((secret) => {
              const secretId = secret._id || secret.id;

              return (
                <div
                  key={secretId}
                  className="grid min-w-[980px] grid-cols-[1.35fr_0.9fr_1.2fr_1.2fr_1fr] items-center gap-4 border-b border-white/10 px-4 text-sm text-slate-300 transition last:border-b-0 hover:bg-white/[0.05]"
                >
                  <div className="flex min-w-0 items-center gap-3 p-4 font-semibold text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <span className="truncate" title={secret.title}>
                      {secret.title}
                    </span>
                  </div>

                  <div className="p-4 text-center">
                    {getSecretSourceLabel(secret)}
                  </div>

                  <div className="whitespace-nowrap p-4 text-center text-slate-400">
                    {new Date(secret.createdAt).toLocaleString()}
                  </div>

                  <div className="whitespace-nowrap p-4 text-center text-slate-400">
                    {new Date(secret.updatedAt || secret.createdAt).toLocaleString()}
                  </div>

                  <div className="p-4">
                    <SecretActionButtons
                      loading={actionLoading}
                      onDelete={() => setSecretToDelete(secret)}
                      onEdit={() => editSecret(secretId)}
                      onView={() => viewSecret(secretId)}
                      secretId={secretId}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm text-slate-300">
            <span>
              Page {secretPage + 1} of {secretPageCount}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSecretPage((page) => Math.max(0, page - 1))}
                disabled={secretPage === 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous secrets page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSecretPage((page) => Math.min(secretPageCount - 1, page + 1))}
                disabled={secretPage >= secretPageCount - 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next secrets page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
