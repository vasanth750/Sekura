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
    <div className="sekura-page px-4 py-8 md:px-8 lg:px-20">
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
        <div className="sekura-panel flex flex-col gap-6 rounded-xl p-5 lg:flex-row lg:items-center lg:justify-between lg:p-7">
          <div>
            <p className="sekura-kicker rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              <ShieldCheck className="h-4 w-4" />
              Encrypted registry
            </p>

            <h1 className="sekura-heading mt-4 text-3xl font-black md:text-5xl">
              Secrets Management
            </h1>

            <p className="sekura-muted mt-3 max-w-2xl text-sm leading-6 md:text-base">
              Securely manage, monitor, and rotate environment variables, API
              keys, certificates, and shared access links.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              className="sekura-secondary-btn inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition"
              onClick={() => setShowSecretPopup(true)}
            >
              <Plus className="h-4 w-4" />
              Add Secret
            </button>

            <button
              className="sekura-primary-btn inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition hover:scale-[1.01]"
              onClick={() => navigate("/create-link")}
            >
              <Link2 className="h-4 w-4" />
              Create Access Link
            </button>
          </div>
        </div>

        <div className="sekura-panel mt-6 rounded-xl p-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search secrets by name, tags, or role..."
              className="sekura-input h-12 w-full rounded-lg px-4 pl-12 text-sm outline-none transition"
            />
          </div>
        </div>

        <div className="sekura-panel mt-6 overflow-hidden rounded-xl">
          <div className="border-b border-slate-200 p-6 dark:border-white/10">
            <h2 className="sekura-heading text-xl font-black">
              Your Secrets
            </h2>

            <p className="sekura-muted mt-1 text-sm">
              Displaying the most recently added secrets in your workspace.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="sekura-table-head grid min-w-[980px] grid-cols-[1.35fr_0.9fr_1.2fr_1.2fr_1fr] items-center gap-4 border-b px-4 py-3 text-sm font-bold">
              <div className="p-4">Secret Name</div>
              <div className="p-4 text-center">Type</div>
              <div className="p-4 text-center">Created</div>
              <div className="p-4 text-center">Updated</div>
              <div className="p-4 text-center">Actions</div>
            </div>

            {loading && (
              <div className="sekura-muted p-6 text-sm">
                Loading secrets...
              </div>
            )}

            {error && (
              <div className="p-6 text-sm font-medium text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && secrets.length === 0 && (
              <div className="sekura-muted p-6 text-sm">
                No secrets stored yet.
              </div>
            )}

            {!loading && !error && pagedSecrets.map((secret) => {
              const secretId = secret._id || secret.id;

              return (
                <div
                  key={secretId}
                  className="sekura-row grid min-w-[980px] grid-cols-[1.35fr_0.9fr_1.2fr_1.2fr_1fr] items-center gap-4 border-b px-4 text-sm transition last:border-b-0"
                >
                  <div className="sekura-heading flex min-w-0 items-center gap-3 p-4 font-semibold">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <span className="truncate" title={secret.title}>
                      {secret.title}
                    </span>
                  </div>

                  <div className="p-4 text-center">
                    {getSecretSourceLabel(secret)}
                  </div>

                  <div className="sekura-muted whitespace-nowrap p-4 text-center">
                    {new Date(secret.createdAt).toLocaleString()}
                  </div>

                  <div className="sekura-muted whitespace-nowrap p-4 text-center">
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

          <div className="sekura-muted flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm dark:border-white/10">
            <span>
              Page {secretPage + 1} of {secretPageCount}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSecretPage((page) => Math.max(0, page - 1))}
                disabled={secretPage === 0}
                className="sekura-secondary-btn inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:text-green-300"
                aria-label="Previous secrets page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSecretPage((page) => Math.min(secretPageCount - 1, page + 1))}
                disabled={secretPage >= secretPageCount - 1}
                className="sekura-secondary-btn inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-700 transition disabled:cursor-not-allowed disabled:opacity-40 dark:text-green-300"
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
