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
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700 transition hover:border-green-300 hover:bg-green-100 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300 dark:hover:bg-green-400/15"
        aria-label="View secret"
        title="View"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled || isBusy}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.12] dark:hover:text-white"
        aria-label="Edit secret"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled || isBusy}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="sekura-panel w-full max-w-[560px] rounded-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="sekura-heading text-2xl font-black">
            {secret.title}
          </h2>

          <button
            onClick={onClose}
            className="sekura-secondary-btn rounded-lg p-2 transition"
            aria-label="Close decrypted secret"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="sekura-heading mt-5 block text-sm font-semibold">
          Decrypted Secret
        </label>

        <textarea
          readOnly
          value={secret.value}
          className="sekura-input mt-2 min-h-[140px] w-full rounded-lg px-4 py-3 outline-none"
        />

        <button
          onClick={onClose}
          className="sekura-primary-btn mt-5 w-full rounded-lg py-3 font-bold transition"
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
      <div className="sekura-panel w-full max-w-md rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-200">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="sekura-heading text-xl font-black">
              Delete secret?
            </h2>
            <p className="sekura-muted mt-2 text-sm leading-6">
              This will permanently delete{" "}
              <span className="sekura-heading font-semibold">
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
            className="sekura-secondary-btn min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="sekura-panel my-4 max-h-[calc(100vh-2rem)] w-full max-w-[600px] overflow-y-auto rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="sekura-heading text-2xl font-black">
            Edit Secret
          </h2>

          <button
            type="button"
            onClick={onCancel}
            className="sekura-secondary-btn rounded-lg p-2 transition"
            aria-label="Close edit secret"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="sekura-heading text-sm font-semibold">
          Secret Name
        </label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="sekura-input mt-2 w-full rounded-lg px-4 py-3 outline-none transition"
        />

        <label className="sekura-heading mt-4 block text-sm font-semibold">
          Secret
        </label>
        <textarea
          rows={8}
          value={value}
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
          className="sekura-input mt-2 min-h-48 w-full resize-y rounded-lg px-4 py-4 font-mono text-sm leading-6 outline-none transition"
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
            className="sekura-secondary-btn min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ title, value })}
            disabled={loading}
            className="sekura-primary-btn min-h-11 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
