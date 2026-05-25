import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export function SecretActionButtons({
  disabled,
  loading,
  onDelete,
  onEdit,
  onView,
  secretId,
}) {
  const isBusy = loading === secretId;

  return (
    <div className="flex justify-center gap-2">
      <button
        type="button"
        onClick={onView}
        disabled={disabled || isBusy}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="View secret"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled || isBusy}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/[0.12] hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Edit secret"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled || isBusy}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-300/15 bg-red-500/10 text-red-300 transition hover:border-red-300/35 hover:bg-red-500/15 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Delete secret"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SecretViewerDialog({ onClose, secret }) {
  if (!secret) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-white">
            {secret.title}
          </h2>

          <button
            onClick={onClose}
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
          value={secret.value}
          className="mt-2 min-h-[140px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none"
        />

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-cyan-300 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function DeleteSecretDialog({ loading, onCancel, onConfirm, secret }) {
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

export function EditSecretDialog({
  error,
  loading,
  onCancel,
  onSave,
  secret,
}) {
  if (!secret) {
    return null;
  }

  return (
    <EditSecretForm
      error={error}
      key={secret._id || secret.id}
      loading={loading}
      onCancel={onCancel}
      onSave={onSave}
      secret={secret}
    />
  );
}

function EditSecretForm({
  error,
  loading,
  onCancel,
  onSave,
  secret,
}) {
  const [title, setTitle] = useState(secret.title || "");
  const [value, setValue] = useState(secret.value || "");

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-white">
            Edit Secret
          </h2>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close edit secret"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="text-sm font-semibold text-slate-200">
          Secret Name
        </label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
        />

        <label className="mt-4 block text-sm font-semibold text-slate-200">
          Secret
        </label>
        <textarea
          rows={8}
          value={value}
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
          className="mt-2 min-h-48 w-full resize-y rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 font-mono text-sm leading-6 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
        />

        {error && (
          <p className="mt-4 text-sm font-medium text-red-300">
            {error}
          </p>
        )}

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
            onClick={() => onSave({ title, value })}
            disabled={loading}
            className="min-h-11 rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
