import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, KeyRound, Link2, ShieldCheck } from "lucide-react";
import api from "../api";
import {
  DeleteSecretDialog,
  EditSecretDialog,
  SecretActionButtons,
  SecretViewerDialog,
} from "../components/secrets/SecretDialogs";

const PAGE_SIZE = 5;

const getSecretSourceLabel = (secret) =>
  secret?.metadata?.source === "request" ? "Requested Secret" : "Your Secret";

export default function Dashboard() {
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState([]);
  const [linkStats, setLinkStats] = useState({
    totalLinks: 0,
    activeLinks: 0,
    recentLinks: [],
  });
  const [secretPage, setSecretPage] = useState(0);
  const [linkPage, setLinkPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewedSecret, setViewedSecret] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [secretToDelete, setSecretToDelete] = useState(null);
  const [secretToEdit, setSecretToEdit] = useState(null);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        setError("");
        setLoading(true);

        const [secretsResponse, linkStatsResponse] = await Promise.all([
          api.get("/api/encrypted-secrets"),
          api.get("/api/share-links/stats/summary"),
        ]);

        setSecrets(secretsResponse.data.secrets || []);
        setLinkStats({
          totalLinks: linkStatsResponse.data.totalLinks || 0,
          activeLinks: linkStatsResponse.data.activeLinks || 0,
          recentLinks: linkStatsResponse.data.recentLinks || [],
        });
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const recentLinks = linkStats.recentLinks || [];
  const secretPageCount = Math.max(1, Math.ceil(secrets.length / PAGE_SIZE));
  const linkPageCount = Math.max(1, Math.ceil(recentLinks.length / PAGE_SIZE));
  const pagedSecrets = secrets.slice(
    secretPage * PAGE_SIZE,
    secretPage * PAGE_SIZE + PAGE_SIZE
  );
  const pagedLinks = recentLinks.slice(
    linkPage * PAGE_SIZE,
    linkPage * PAGE_SIZE + PAGE_SIZE
  );

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

  const stats = [
    {
      title: "Total Secrets",
      value: secrets.length,
      icon: KeyRound,
    },
    {
      title: "Created Links",
      value: linkStats.totalLinks,
      icon: Link2,
    },
    {
      title: "Active Links",
      value: linkStats.activeLinks,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="sekura-page min-h-full px-4 py-8 text-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <SecretViewerDialog
        onClose={() => setViewedSecret(null)}
        secret={viewedSecret}
      />

      <DeleteSecretDialog
        loading={Boolean(actionLoading)}
        onCancel={() => setSecretToDelete(null)}
        onConfirm={deleteSecret}
        secret={secretToDelete}
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
        <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-7 dark:border-white/10 dark:bg-slate-900">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
              <ShieldCheck className="h-4 w-4" />
              Secure workspace
            </p>

            <h1 className="mt-4 text-3xl font-black text-slate-950 md:text-5xl dark:text-white">
              Welcome back
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base dark:text-slate-400">
              Monitor encrypted credentials, create short-lived links, and keep
              sensitive material moving through trusted paths.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/secrets")}
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-green-200 hover:bg-green-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.12]"
            >
              New Secret
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => {
            const ItemIcon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:hover:border-green-400/20"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-200">
                    {item.title}
                  </h3>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300">
                    <ItemIcon className="h-5 w-5" />
                  </span>
                </div>

                <h2 className="mt-5 text-4xl font-black text-slate-950 dark:text-white">
                  {item.value}
                </h2>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
          <div className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-white/10">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                Recent Secrets
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                The 5 most recently added credentials in your workspace.
              </p>
            </div>

            <div className="flex-1 overflow-x-auto">
              <div className="flex h-full min-w-[620px] flex-col">
                <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-4 border-b border-green-200 bg-green-50 px-5 py-3 text-sm font-bold text-green-800 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
                  <p>Secret Name</p>
                  <p className="text-center">Type</p>
                  <p className="text-center">Actions</p>
                </div>

                <div className="min-h-[340px] flex-1">
                  {loading && (
                    <div className="px-5 py-5 text-sm text-slate-600 dark:text-slate-400">
                      Loading recent secrets...
                    </div>
                  )}

                  {error && (
                    <div className="px-5 py-5 text-sm font-medium text-red-600 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  {!loading && !error && pagedSecrets.length === 0 && (
                    <div className="px-5 py-5 text-sm text-slate-600 dark:text-slate-400">
                      No secrets stored yet.
                    </div>
                  )}

                  {!loading && !error && pagedSecrets.map((secret) => {
                    const secretId = secret._id || secret.id;

                    return (
                      <div
                        key={secretId}
                        className="grid min-h-[68px] grid-cols-[1.4fr_1fr_1fr] items-center gap-4 border-b border-slate-100 px-5 py-4 text-sm text-slate-600 transition last:border-b-0 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                      >
                        <p className="truncate font-semibold text-slate-950 dark:text-white" title={secret.title}>
                          {secret.title}
                        </p>

                        <p className="text-center text-slate-600 dark:text-slate-300">
                          {getSecretSourceLabel(secret)}
                        </p>

                        <div className="flex justify-center">
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
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
              <span>
                Page {secretPage + 1} of {secretPageCount}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSecretPage((page) => Math.max(0, page - 1))}
                  disabled={secretPage === 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-green-300 dark:hover:bg-white/10"
                  aria-label="Previous secrets page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSecretPage((page) => Math.min(secretPageCount - 1, page + 1))}
                  disabled={secretPage >= secretPageCount - 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-green-300 dark:hover:bg-white/10"
                  aria-label="Next secrets page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-white/10">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                Recent Links
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                The 5 most recently created secure links.
              </p>
            </div>

            <div className="flex-1 overflow-x-auto">
              <div className="flex h-full min-w-[560px] flex-col">
                <div className="grid grid-cols-[1.4fr_1fr_0.8fr] items-center gap-4 border-b border-green-200 bg-green-50 px-5 py-3 text-sm font-bold text-green-800 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
                  <p>Link Title</p>
                  <p className="text-center">Status</p>
                  <p className="text-center">Reads</p>
                </div>

                <div className="min-h-[340px] flex-1">
                  {loading && (
                    <div className="px-5 py-5 text-sm text-slate-600 dark:text-slate-400">
                      Loading recent links...
                    </div>
                  )}

                  {!loading && !error && pagedLinks.length === 0 && (
                    <div className="px-5 py-5 text-sm text-slate-600 dark:text-slate-400">
                      No secure links created yet.
                    </div>
                  )}

                  {!loading && !error && pagedLinks.map((link) => {
                    const isExpired = new Date(link.expiresAt) <= new Date();
                    const status = isExpired ? "Expired" : "Active";

                    return (
                      <div
                        key={link.token}
                        className="grid min-h-[68px] grid-cols-[1.4fr_1fr_0.8fr] items-center gap-4 border-b border-slate-100 px-5 py-4 text-sm text-slate-600 transition last:border-b-0 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                      >
                        <p className="truncate font-semibold text-slate-950 dark:text-white" title={link.title}>
                          {link.title}
                        </p>

                        <p className={`text-center font-semibold ${isExpired ? "text-red-600 dark:text-red-300" : "text-green-700 dark:text-emerald-200"}`}>
                          {status}
                        </p>

                        <p className="text-center tabular-nums">
                          {link.readCount}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
              <span>
                Page {linkPage + 1} of {linkPageCount}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLinkPage((page) => Math.max(0, page - 1))}
                  disabled={linkPage === 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-green-300 dark:hover:bg-white/10"
                  aria-label="Previous links page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLinkPage((page) => Math.min(linkPageCount - 1, page + 1))}
                  disabled={linkPage >= linkPageCount - 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-green-300 dark:hover:bg-white/10"
                  aria-label="Next links page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
