import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, KeyRound, Link2, ShieldCheck } from "lucide-react";
import api from "../api";

const PAGE_SIZE = 5;

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
    <div className="relative isolate min-h-full overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_16%_8%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_84%_14%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              Secure workspace
            </p>

            <h1 className="mt-4 text-3xl font-black text-white md:text-5xl">
              Welcome back
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              Monitor encrypted credentials, create short-lived links, and keep
              sensitive material moving through trusted paths.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/secrets")}
              className="rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
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
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-300/25"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-200">
                    {item.title}
                  </h3>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                    <ItemIcon className="h-5 w-5" />
                  </span>
                </div>

                <h2 className="mt-5 text-4xl font-black text-white">
                  {item.value}
                </h2>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="border-b border-white/10 p-5">
              <h2 className="text-2xl font-black text-white">
                Recent Secrets
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                The 5 most recently added credentials in your workspace.
              </p>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[2.5fr_1.4fr_2fr_1fr] gap-4 border-b border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100">
                  <p>Secret Name</p>
                  <p>Type</p>
                  <p>Added</p>
                  <p>Actions</p>
                </div>

                {loading && (
                  <div className="px-5 py-4 text-sm text-slate-400">
                    Loading recent secrets...
                  </div>
                )}

                {error && (
                  <div className="px-5 py-4 text-sm font-medium text-red-300">
                    {error}
                  </div>
                )}

                {!loading && !error && pagedSecrets.length === 0 && (
                  <div className="px-5 py-4 text-sm text-slate-400">
                    No secrets stored yet.
                  </div>
                )}

                {!loading && !error && pagedSecrets.map((secret) => (
                  <div
                    key={secret._id || secret.id}
                    className="grid grid-cols-[2.5fr_1.4fr_2fr_1fr] items-center gap-4 border-b border-white/10 px-5 py-4 text-sm text-slate-300 transition last:border-b-0 hover:bg-white/[0.05]"
                  >
                    <p className="font-semibold text-white">
                      {secret.title}
                    </p>

                    <p className="capitalize">
                      {secret.type}
                    </p>

                    <p>
                      {new Date(secret.createdAt).toLocaleString()}
                    </p>

                    <button
                      onClick={() => navigate("/secrets")}
                      className="text-left font-semibold text-cyan-200 transition hover:text-cyan-100"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
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

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="border-b border-white/10 p-5">
              <h2 className="text-2xl font-black text-white">
                Recent Links
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                The 5 most recently created secure links.
              </p>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[2.5fr_1.4fr_2fr_0.8fr] gap-4 border-b border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100">
                  <p>Link Title</p>
                  <p>Status</p>
                  <p>Expires</p>
                  <p>Reads</p>
                </div>

                {loading && (
                  <div className="px-5 py-4 text-sm text-slate-400">
                    Loading recent links...
                  </div>
                )}

                {!loading && !error && pagedLinks.length === 0 && (
                  <div className="px-5 py-4 text-sm text-slate-400">
                    No secure links created yet.
                  </div>
                )}

                {!loading && !error && pagedLinks.map((link) => {
                  const isExpired = new Date(link.expiresAt) <= new Date();
                  const isOpened = link.readCount > 0;
                  const status = isExpired
                    ? "Expired"
                    : isOpened
                      ? "Opened"
                      : "Active";

                  return (
                    <div
                      key={link.token}
                      className="grid grid-cols-[2.5fr_1.4fr_2fr_0.8fr] items-center gap-4 border-b border-white/10 px-5 py-4 text-sm text-slate-300 transition last:border-b-0 hover:bg-white/[0.05]"
                    >
                      <p className="font-semibold text-white">
                        {link.title}
                      </p>

                      <p className="font-semibold text-cyan-100">
                        {status}
                      </p>

                      <p>
                        {new Date(link.expiresAt).toLocaleString()}
                      </p>

                      <p>
                        {link.readCount}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 text-sm text-slate-300">
              <span>
                Page {linkPage + 1} of {linkPageCount}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLinkPage((page) => Math.max(0, page - 1))}
                  disabled={linkPage === 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous links page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLinkPage((page) => Math.min(linkPageCount - 1, page + 1))}
                  disabled={linkPage >= linkPageCount - 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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
