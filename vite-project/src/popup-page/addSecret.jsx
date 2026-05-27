import { useState } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, FileText, Image, LockKeyhole, Paperclip, X } from "lucide-react";
import api from "../api";
import { fileToDataUrl, formatBytes, MAX_ATTACHMENT_BYTES } from "../lib/attachments";

export default function AddSecret({ closePopup, onSecretCreated }) {
  const [secretName, setSecretName] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileValue, setAttachedFileValue] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveSecret = async () => {
    try {
      setError("");

      if (!secretName.trim() || (!secretValue.trim() && !attachedFileValue)) {
        setError("Secret name and value are required");
        return;
      }

      setLoading(true);

      const response = await api.post("/api/encrypted-secrets", {
        title: secretName,
        value: attachedFileValue || secretValue,
        type: attachedFile ? "file" : "secret",
        contentType: attachedFile?.type || "text/plain",
        originalFileName: attachedFile?.name,
        byteLength: attachedFile?.size,
      });

      onSecretCreated(response.data.secret);
      closePopup();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to save secret");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    setError("");

    if (!file) {
      setAttachedFile(null);
      setAttachedFileValue("");
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError(`Files must be ${formatBytes(MAX_ATTACHMENT_BYTES)} or smaller.`);
      event.target.value = "";
      return;
    }

    try {
      setAttachedFile(file);
      setAttachedFileValue(await fileToDataUrl(file));
      if (!secretName.trim()) {
        setSecretName(file.name);
      }
    } catch (fileError) {
      setError(fileError.message);
      setAttachedFile(null);
      setAttachedFileValue("");
    }
  };

  const clearFile = () => {
    setAttachedFile(null);
    setAttachedFileValue("");
  };

  return createPortal(
    <div className="sekura-modal-backdrop fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="sekura-panel my-4 max-h-[calc(100vh-2rem)] w-full max-w-[600px] overflow-y-auto rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <h2 className="sekura-heading text-2xl font-black">
              Add Secret
            </h2>
          </div>

          <button
            onClick={closePopup}
            className="sekura-secondary-btn rounded-lg p-2 transition"
            aria-label="Close add secret"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="sekura-heading text-sm font-semibold">
            Secret Name
          </label>

          <input
            type="text"
            placeholder="Enter Secret Name"
            value={secretName}
            onChange={(e) => {
              setSecretName(e.target.value);
            }}
            className="sekura-input rounded-lg px-4 py-3 outline-none transition"
          />

          <label className="sekura-heading mt-3 text-sm font-semibold">
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
              className={`sekura-input min-h-48 w-full resize-y rounded-lg px-4 py-4 pr-14 font-mono text-sm leading-6 outline-none transition placeholder:font-sans ${showSecret ? "" : "[-webkit-text-security:disc]"}`}
            />

            <button
              type="button"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-green-50 hover:text-green-700 dark:hover:bg-white/10 dark:hover:text-green-100"
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

          <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-slate-600 dark:border-green-400/20 dark:bg-green-400/10 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
              <FileText className="h-4 w-4" />
              Multi-line secrets supported
            </span>
            <span>{secretValue.length.toLocaleString()} characters</span>
          </div>

          <label className="sekura-secondary-btn mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition">
            <Paperclip className="h-4 w-4" />
            Attach File Or Image
            <input
              type="file"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          {attachedFile && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-400/20 dark:bg-green-400/10">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 dark:bg-white/10 dark:text-green-200">
                  {attachedFile.type.startsWith("image/") ? (
                    <Image className="h-4 w-4" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="sekura-heading truncate font-semibold">
                    {attachedFile.name}
                  </p>
                  <p className="sekura-muted text-xs">
                    {attachedFile.type || "File"} - {formatBytes(attachedFile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="sekura-secondary-btn rounded-lg px-3 py-2 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          )}
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
          className="sekura-primary-btn mt-6 w-full rounded-lg py-3 font-bold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Secret"}
        </button>
      </div>
    </div>,
    document.body
  );
}
