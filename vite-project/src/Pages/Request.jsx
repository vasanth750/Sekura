import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Link2,
  Loader2,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import api from "../api";

const REQUESTS_PAGE_SIZE = 5;

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function CreateRequestPage() {
  const [requestName, setRequestName] = useState("");
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [editingRequestId, setEditingRequestId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [savingRequestId, setSavingRequestId] = useState("");
  const [deletingRequestId, setDeletingRequestId] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestPage, setRequestPage] = useState(0);
  const [error, setError] = useState("");
  const [tableError, setTableError] = useState("");

  const selectedLink = useMemo(() => {
    if (!selectedRequest?.id) {
      return "";
    }

    const params = new URLSearchParams({
      type: "collect",
    });

    return `${window.location.origin}/request/${selectedRequest.id}?${params.toString()}`;
  }, [selectedRequest]);

  const filteredRequests = useMemo(() => {
    const query = requestSearch.trim().toLowerCase();

    if (!query) {
      return requests;
    }

    return requests.filter((request) =>
      [
        request.title,
        request.status,
        request.submittedSecret?.title,
        request.submittedSecret?.type,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [requestSearch, requests]);

  const requestPageCount = Math.max(
    1,
    Math.ceil(filteredRequests.length / REQUESTS_PAGE_SIZE)
  );
  const safeRequestPage = Math.min(requestPage, requestPageCount - 1);
  const visibleRequests = filteredRequests.slice(
    safeRequestPage * REQUESTS_PAGE_SIZE,
    safeRequestPage * REQUESTS_PAGE_SIZE + REQUESTS_PAGE_SIZE
  );

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      setTableError("");

      const response = await api.get("/api/secret-requests");
      setRequests(response.data.requests || []);
      setRequestPage(0);
    } catch (requestError) {
      setTableError(
        requestError.response?.data?.message || "Unable to load request links."
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    api
      .get("/api/secret-requests")
      .then((response) => {
        if (!ignore) {
          setRequests(response.data.requests || []);
          setRequestPage(0);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setTableError(
            requestError.response?.data?.message || "Unable to load request links."
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingRequests(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleGenerateLink = async () => {
    try {
      setCreating(true);
      setError("");
      setCopied(false);

      const response = await api.post("/api/secret-requests", {
        title: requestName,
      });

      const createdRequest = response.data.request;
      setRequests((currentRequests) => [createdRequest, ...currentRequests]);
      setSelectedRequest(createdRequest);
      setRequestName("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to generate request link."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(selectedLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const startEditing = (request) => {
    setEditingRequestId(request.id);
    setEditingTitle(request.title);
    setTableError("");
  };

  const cancelEditing = () => {
    setEditingRequestId("");
    setEditingTitle("");
  };

  const saveRequestTitle = async (requestId) => {
    try {
      setSavingRequestId(requestId);
      setTableError("");

      const response = await api.put(`/api/secret-requests/${requestId}`, {
        title: editingTitle,
      });
      const updatedRequest = response.data.request;

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? updatedRequest : request
        )
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(updatedRequest);
      }

      cancelEditing();
    } catch (requestError) {
      setTableError(
        requestError.response?.data?.message || "Unable to update request link."
      );
    } finally {
      setSavingRequestId("");
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      setDeletingRequestId(requestId);
      setTableError("");

      await api.delete(`/api/secret-requests/${requestId}`);

      setRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== requestId)
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
    } catch (requestError) {
      setTableError(
        requestError.response?.data?.message || "Unable to delete request link."
      );
    } finally {
      setDeletingRequestId("");
    }
  };

  return (
    <div className="sekura-page min-h-full p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <aside className="sekura-panel mx-auto w-full max-w-3xl overflow-hidden rounded-xl">
          <div className="border-b border-green-200 bg-green-50 p-6 dark:border-green-400/20 dark:bg-green-400/10">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-green-200 bg-white p-3 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
                <Link2 size={28} />
              </div>

              <div>
                <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-700 dark:text-green-300">
                  <ShieldCheck className="h-4 w-4" />
                  Protected collection
                </p>

                <h2 className="sekura-heading text-2xl font-black">
                  Create Request
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <label className="sekura-heading mb-2 block text-sm font-semibold">
                What is this request for?
              </label>

              <input
                type="text"
                placeholder="Example: Production Database Password"
                value={requestName}
                onChange={(event) => {
                  setRequestName(event.target.value);
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
              type="button"
              onClick={handleGenerateLink}
              disabled={!requestName.trim() || creating}
              className="sekura-primary-btn flex w-full items-center justify-center gap-2 rounded-lg py-4 text-base font-bold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
              {creating ? "Generating..." : "Generate Request Link"}
            </button>

            {selectedLink && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-emerald-300/20 dark:bg-emerald-300/10">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-green-700 dark:text-emerald-200" />
                  <h3 className="sekura-heading text-lg font-bold">
                    Request Link
                  </h3>
                </div>

                <input
                  type="text"
                  readOnly
                  value={selectedLink}
                  className="sekura-input w-full rounded-lg px-4 py-3 font-mono text-xs outline-none"
                />

                {selectedRequest?.submittedSecret && (
                  <div className="mt-3 rounded-lg border border-green-200 bg-white/70 p-3 text-sm dark:border-green-300/20 dark:bg-white/10">
                    <p className="sekura-muted text-xs font-bold uppercase tracking-[0.14em]">
                      Submitted Secret
                    </p>
                    <p className="sekura-heading mt-1 font-bold">
                      {selectedRequest.submittedSecret.title}
                    </p>
                    <p className="sekura-muted mt-1 text-xs capitalize">
                      {selectedRequest.submittedSecret.type} submitted {formatDateTime(selectedRequest.submittedAt)}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="sekura-secondary-btn mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold transition"
                >
                  <Copy size={18} />
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>
            )}
          </div>
        </aside>

        <section className="sekura-panel w-full overflow-hidden rounded-xl">
          <div className="flex flex-col gap-4 border-b border-green-200 bg-green-50 p-6 dark:border-green-400/20 dark:bg-green-400/10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-700 dark:text-green-300">
                <ShieldCheck className="h-4 w-4" />
                Request history
              </p>

              <h1 className="sekura-heading text-2xl font-black md:text-3xl">
                Created Requests
              </h1>
            </div>

            <button
              type="button"
              onClick={fetchRequests}
              disabled={loadingRequests}
              className="sekura-secondary-btn inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loadingRequests ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="p-6">
            {tableError && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-300/25 bg-red-500/10 p-4 text-red-100">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p className="text-sm font-semibold">{tableError}</p>
              </div>
            )}

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <input
                type="search"
                value={requestSearch}
                onChange={(event) => {
                  setRequestSearch(event.target.value);
                  setRequestPage(0);
                }}
                placeholder="Search requests"
                className="sekura-input w-full rounded-lg px-4 py-3 text-sm outline-none md:max-w-sm"
              />

              <p className="sekura-muted text-sm font-semibold">
                Showing {visibleRequests.length} of {filteredRequests.length} requests
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                    <th className="px-3 py-3 font-bold">Request</th>
                    <th className="px-3 py-3 font-bold">Secret</th>
                    <th className="px-3 py-3 font-bold">Entered</th>
                    <th className="px-3 py-3 font-bold">Created Time</th>
                    <th className="px-3 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingRequests ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-10 text-center">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading requests...
                        </span>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-3 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-300">
                        {requestSearch.trim()
                          ? "No matching request links found."
                          : "No request links created yet."}
                      </td>
                    </tr>
                  ) : (
                    visibleRequests.map((request) => {
                      const isEditing = editingRequestId === request.id;
                      const isSaving = savingRequestId === request.id;
                      const isDeleting = deletingRequestId === request.id;

                      return (
                        <tr key={request.id} className="border-b border-slate-200 last:border-0 dark:border-white/10">
                          <td className="px-3 py-4 align-middle">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(event) => setEditingTitle(event.target.value)}
                                className="sekura-input w-full rounded-lg px-3 py-2 outline-none"
                              />
                            ) : (
                              <p className="sekura-heading font-bold">{request.title}</p>
                            )}
                          </td>

                          <td className="px-3 py-4 align-middle">
                            <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold capitalize text-green-700 dark:border-green-300/20 dark:bg-green-300/10 dark:text-green-200">
                              {request.submittedSecret?.title || "Waiting for submission"}
                            </span>
                          </td>

                          <td className="px-3 py-4 align-middle">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                request.status === "submitted"
                                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-300/20 dark:bg-green-300/10 dark:text-green-200"
                                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100"
                              }`}
                            >
                              {request.status === "submitted" ? "Yes" : "No"}
                            </span>
                          </td>

                          <td className="px-3 py-4 align-middle text-slate-600 dark:text-slate-300">
                            {formatDateTime(request.createdAt)}
                          </td>

                          <td className="px-3 py-4 align-middle">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => saveRequestTitle(request.id)}
                                    disabled={isSaving || editingTitle.trim().length < 3}
                                    className="sekura-primary-btn inline-flex h-10 w-10 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Save request"
                                  >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="sekura-secondary-btn inline-flex h-10 w-10 items-center justify-center rounded-lg transition"
                                    aria-label="Cancel edit"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRequest(request)}
                                    className="sekura-secondary-btn inline-flex h-10 w-10 items-center justify-center rounded-lg transition"
                                    aria-label="View request link"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => startEditing(request)}
                                    className="sekura-secondary-btn inline-flex h-10 w-10 items-center justify-center rounded-lg transition"
                                    aria-label="Edit request"
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteRequest(request.id)}
                                    disabled={isDeleting}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-300/25 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Delete request"
                                    title="Delete"
                                  >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredRequests.length > REQUESTS_PAGE_SIZE && (
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <p className="sekura-muted text-sm font-semibold">
                  Page {safeRequestPage + 1} of {requestPageCount}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestPage((page) => Math.max(0, page - 1))}
                    disabled={safeRequestPage === 0}
                    className="sekura-secondary-btn rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRequestPage((page) =>
                        Math.min(requestPageCount - 1, page + 1)
                      )
                    }
                    disabled={safeRequestPage >= requestPageCount - 1}
                    className="sekura-secondary-btn rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
