import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import { z } from "zod";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FileLock2,
  Image,
  KeyRound,
  Link2,
  Loader2,
  LockKeyhole,
  Paperclip,
  RadioTower,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Users,
  X,
} from "lucide-react";
import api from "../api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  createRandomBytes,
  createStandardEncryptedShare,
  derivePbkdf2KeyBytes,
  encryptJsonWithSessionKey,
  normalizeEmail,
  wrapSessionKey,
} from "../lib/liveSessionCrypto";
import { fileToDataUrl, formatBytes, MAX_ATTACHMENT_BYTES } from "../lib/attachments";

const SHARE_MODE_STANDARD = "standard";
const SHARE_MODE_PROTECTED = "protected";

const standardExpirationOptions = [
  { value: "5-minutes", label: "5 Minutes" },
  { value: "1-hour", label: "1 Hour" },
  { value: "24-hours", label: "24 Hours" },
  { value: "7-days", label: "7 Days" },
];

const protectedExpirationOptions = [
  { value: "2-minutes", label: "2 Minutes" },
  { value: "5-minutes", label: "5 Minutes" },
  { value: "10-minutes", label: "10 Minutes" },
  { value: "15-minutes", label: "15 Minutes" },
  { value: "30-minutes", label: "30 Minutes" },
];

const standardExpirationDurations = {
  "5-minutes": 5 * 60 * 1000,
  "1-hour": 60 * 60 * 1000,
  "24-hours": 24 * 60 * 60 * 1000,
  "7-days": 7 * 24 * 60 * 60 * 1000,
};

const protectedExpirationDurations = {
  "2-minutes": 2 * 60 * 1000,
  "5-minutes": 5 * 60 * 1000,
  "10-minutes": 10 * 60 * 1000,
  "15-minutes": 15 * 60 * 1000,
  "30-minutes": 30 * 60 * 1000,
};

const participantPollIntervalMs = 4000;

const formSchema = z.object({
  secretName: z
    .string()
    .trim()
    .min(3, "Secret name must be at least 3 characters."),
  message: z
    .string()
    .trim()
    .max(1200, "Secret message cannot exceed 1200 characters.")
    .optional(),
  expiration: z.string().min(1, "Choose an expiration time."),
  password: z.string().optional(),
});

const defaultValues = {
  secretName: "",
  message: "",
  expiration: "1-hour",
  password: "",
};

function getStandardExpirationDate(expiration) {
  const duration =
    standardExpirationDurations[expiration] || standardExpirationDurations["1-hour"];

  return new Date(Date.now() + duration);
}

function getProtectedExpirationDate(expiration) {
  const duration =
    protectedExpirationDurations[expiration] || protectedExpirationDurations["5-minutes"];

  return new Date(Date.now() + duration);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(onDone, 2400);

    return () => window.clearTimeout(timer);
  }, [toast, onDone]);

  const tone =
    toast?.type === "error"
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-100"
      : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-100";

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          className={`fixed right-4 top-4 z-[70] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${tone}`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "error" ? (
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-100" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-100" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QrPreview({ value }) {
  return (
    <div
      className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border border-green-200 bg-white p-3 shadow-xl shadow-green-500/10 dark:border-green-300/20"
      aria-label="QR code preview for the generated secure link"
      role="img"
    >
      <QRCodeSVG
        value={value}
        size={150}
        bgColor="#ffffff"
        fgColor="#020617"
        level="M"
        includeMargin={false}
      />
    </div>
  );
}

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm font-medium text-red-600 dark:text-red-300" role="alert">
      {message}
    </p>
  );
}

function ShareModeSelector({ shareMode, onChange, disabled }) {
  return (
    <div className="space-y-3">
      <Label>Share security mode</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(SHARE_MODE_STANDARD)}
          className={`rounded-xl border p-4 text-left transition ${
            shareMode === SHARE_MODE_STANDARD
              ? "border-green-300/50 bg-green-300/10 ring-1 ring-green-300/30"
              : "border-slate-200 bg-white hover:border-green-200 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-green-300/25"
          }`}
        >
          <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Link2 className="h-4 w-4 text-green-600 dark:text-green-300" />
            Standard link
          </p>
          <p className="sekura-muted mt-2 text-xs leading-5">
            Fast share with key in URL fragment. Optional password.
          </p>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(SHARE_MODE_PROTECTED)}
          className={`rounded-xl border p-4 text-left transition ${
            shareMode === SHARE_MODE_PROTECTED
              ? "border-green-300/50 bg-green-300/10 ring-1 ring-green-300/30"
              : "border-slate-200 bg-white hover:border-green-200 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-green-300/25"
          }`}
        >
          <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <RadioTower className="h-4 w-4 text-green-600 dark:text-green-300" />
            Protected session
          </p>
          <p className="sekura-muted mt-2 text-xs leading-5">
            OTP required. No key in URL. You control who can decrypt.
          </p>
        </button>
      </div>
    </div>
  );
}

function GeneratedLinkPreview({ generatedLink, shareMode, onCopy }) {
  if (!generatedLink) {
    return null;
  }

  const isProtected = shareMode === SHARE_MODE_PROTECTED;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-300/20 dark:bg-emerald-300/[0.07]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-300 via-emerald-300 to-green-500" />
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="sekura-heading text-lg font-bold">
            {isProtected ? "Protected Session Ready" : "Secure Link Ready"}
          </h2>
          <p className="sekura-muted text-sm">
            {isProtected
              ? "Share the join link. Keep this tab open while participants verify."
              : "Share it through a trusted channel."}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Label htmlFor="generatedLink">
          {isProtected ? "Session join link" : "Generated secure link"}
        </Label>
        <div className="flex flex-col gap-3 lg:flex-row">
          <Input
            id="generatedLink"
            value={generatedLink}
            readOnly
            className="font-mono text-xs"
            onFocus={(event) => event.target.select()}
          />
          <Button
            type="button"
            onClick={onCopy}
            className="border border-green-200 bg-green-600 text-white shadow-lg shadow-green-500/20 hover:bg-green-700 dark:border-transparent dark:bg-white dark:text-slate-950 dark:hover:bg-green-100 lg:min-w-28"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <QrPreview value={generatedLink} />
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            isProtected
              ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-300/25 dark:bg-blue-300/10 dark:text-blue-100"
              : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-100"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold leading-6">
            {isProtected
              ? "Recipients must verify email with OTP. Decryption key is never in the URL."
              : "Anyone with the full link (including the URL key) can access the secret."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ProtectedSessionPanel({
  session,
  participants,
  wrappingEmails,
  joinUrl,
  hostError,
  ending,
  onEndSession,
  onCopyJoinLink,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 rounded-2xl border border-blue-300/20 bg-blue-300/[0.06] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-200">
            Protected session active
          </p>
          <p className="sekura-heading mt-1 text-lg font-bold">
            Status:{" "}
            <span className="text-emerald-300">
              {session.status === "active" ? "Active" : "Ended"}
            </span>
          </p>
          <p className="sekura-muted mt-1 text-xs">
            Expires at {formatDate(session.expiresAt)}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onEndSession}
          disabled={ending || session.status !== "active"}
        >
          {ending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ending
            </>
          ) : (
            <>
              <Square className="h-4 w-4" />
              End Session
            </>
          )}
        </Button>
      </div>

      {hostError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-300/30 dark:bg-red-500/10 dark:text-red-200">
          {hostError}
        </div>
      ) : null}

      <div>
        <Label htmlFor="protectedJoinUrl">Join URL</Label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Input
            id="protectedJoinUrl"
            readOnly
            value={joinUrl}
            className="font-mono text-xs"
          />
          <Button type="button" onClick={onCopyJoinLink}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <p className="inline-flex items-center gap-2 text-sm font-bold">
            <Users className="h-4 w-4" />
            Participants
          </p>
          <span className="text-xs text-slate-500">{participants.length} verified</span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {participants.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-500">
              Waiting for participants to verify OTP...
            </div>
          ) : (
            participants.map((participant) => {
              const isWrapping = wrappingEmails.includes(participant.email);

              return (
                <div
                  key={participant.email}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{participant.email}</p>
                    <p className="text-xs text-slate-500">
                      Verified at {formatDate(participant.verifiedAt)}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold dark:border-white/10">
                    {isWrapping ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Preparing
                      </>
                    ) : participant.hasWrappedSessionKey ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Ready
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        Pending
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Keep this tab open until the session ends. Closing it prevents preparing access for new participants.
      </p>
    </motion.div>
  );
}

function RecentSecretsPanel({
  filteredSecrets,
  loadingSecrets,
  loadingSecretId,
  onSelectSecret,
  searchValue,
  secretsError,
  selectedSecretId,
  setSearchValue,
}) {
  const hasSearch = searchValue.trim().length > 0;
  const displayedSecrets = hasSearch ? filteredSecrets : filteredSecrets.slice(0, 5);

  return (
    <Card className="p-5 sm:p-6 lg:sticky lg:top-28">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-200">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="sekura-heading text-lg font-bold">Recent Secrets</h2>
          <p className="sekura-muted text-sm">Pick from your 5 latest secrets or search.</p>
        </div>
      </div>

      <div className="relative mt-5">
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search your secrets..."
          className="pl-11"
          aria-label="Search your secrets"
        />
      </div>

      <div className="mt-5 space-y-3">
        {loadingSecrets && (
          <div className="sekura-surface rounded-lg px-4 py-3 text-sm sekura-muted">
            Loading your secrets...
          </div>
        )}

        {secretsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-300/20 dark:bg-red-500/10 dark:text-red-200">
            {secretsError}
          </div>
        )}

        {!loadingSecrets && !secretsError && displayedSecrets.length === 0 && (
          <div className="sekura-surface rounded-lg px-4 py-5 text-center text-sm sekura-muted">
            No matching secrets found.
          </div>
        )}

        {!loadingSecrets &&
          !secretsError &&
          displayedSecrets.map((secret) => {
            const secretId = secret._id || secret.id;
            const isSelected = selectedSecretId === secretId;
            const isLoading = loadingSecretId === secretId;

            return (
              <div
                key={secretId}
                className={`rounded-xl border p-4 transition ${
                  isSelected
                    ? "border-green-300/40 bg-green-300/10"
                    : "border-slate-200 bg-white hover:border-green-200 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-green-300/25"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="sekura-heading break-words text-sm font-bold">
                    {secret.title}
                  </p>
                  <Button
                    type="button"
                    onClick={() => onSelectSecret(secret)}
                    disabled={Boolean(loadingSecretId)}
                    className="min-h-10 shrink-0 px-3 py-2 text-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Loading
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" aria-hidden="true" />
                        Use Secret
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
      </div>
    </Card>
  );
}

export default function CreateSecretLinkPage() {
  const [shareMode, setShareMode] = useState(SHARE_MODE_STANDARD);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [toast, setToast] = useState(null);
  const [recentSecrets, setRecentSecrets] = useState([]);
  const [secretSearch, setSecretSearch] = useState("");
  const [loadingSecrets, setLoadingSecrets] = useState(true);
  const [secretsError, setSecretsError] = useState("");
  const [loadingSecretId, setLoadingSecretId] = useState("");
  const [selectedSecretId, setSelectedSecretId] = useState("");
  const [selectedSecretTitle, setSelectedSecretTitle] = useState("");
  const [fileAttachment, setFileAttachment] = useState(null);
  const [burnAfterReading, setBurnAfterReading] = useState(false);

  const [protectedSession, setProtectedSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [wrappingEmails, setWrappingEmails] = useState([]);
  const [hostError, setHostError] = useState("");
  const [endingSession, setEndingSession] = useState(false);

  const sessionKeyRef = useRef(null);
  const wrappingQueueRef = useRef(new Set());

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const messageValue = useWatch({ control, name: "message" }) || "";
  const messageLength = messageValue.length;
  const expirationValue = useWatch({ control, name: "expiration" });

  const expirationOptions =
    shareMode === SHARE_MODE_PROTECTED
      ? protectedExpirationOptions
      : standardExpirationOptions;

  const protectedJoinUrl = useMemo(() => {
    if (!protectedSession?.id) {
      return "";
    }

    return `${window.location.origin}/session/${protectedSession.id}`;
  }, [protectedSession?.id]);

  const hasActiveProtectedSession =
    shareMode === SHARE_MODE_PROTECTED && protectedSession?.status === "active";

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleFileAttachment = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      showToast("error", `Files must be ${formatBytes(MAX_ATTACHMENT_BYTES)} or smaller.`);
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setFileAttachment({
        name: file.name,
        contentType: file.type || "application/octet-stream",
        byteLength: file.size,
        dataUrl,
      });
      if (!messageValue.trim()) {
        setValue("message", `Attached file: ${file.name}`, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      showToast("success", "File attached.");
    } catch (fileError) {
      showToast("error", fileError.message);
    } finally {
      event.target.value = "";
    }
  };

  const clearFileAttachment = () => {
    setFileAttachment(null);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRecentSecrets = async () => {
      try {
        setSecretsError("");
        setLoadingSecrets(true);

        const response = await api.get("/api/encrypted-secrets");

        if (isMounted) {
          setRecentSecrets(response.data.secrets || []);
        }
      } catch (error) {
        if (isMounted) {
          setSecretsError(
            error.response?.data?.message || "Unable to load your secrets."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingSecrets(false);
        }
      }
    };

    fetchRecentSecrets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!protectedSession?.id || protectedSession.status !== "active") {
      return undefined;
    }

    let cancelled = false;
    let intervalId = null;

    const tick = async () => {
      try {
        const response = await api.get(
          `/api/live-sessions/${protectedSession.id}/host-status`
        );

        if (cancelled) {
          return;
        }

        setProtectedSession((current) => ({
          ...(current || {}),
          ...response.data.session,
        }));
        setParticipants(response.data.participants || []);
        setHostError("");
      } catch (pollError) {
        if (!cancelled) {
          setHostError(
            pollError.response?.data?.message ||
              "Unable to refresh protected session status"
          );
        }
      }
    };

    intervalId = window.setInterval(tick, participantPollIntervalMs);
    tick();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [protectedSession?.id, protectedSession?.status]);

  useEffect(() => {
    if (!protectedSession?.id || protectedSession.status !== "active") {
      return;
    }

    const wrapMissingParticipants = async () => {
      for (const participant of participants) {
        if (participant.status !== "verified" || participant.hasWrappedSessionKey) {
          continue;
        }

        if (!sessionKeyRef.current || !protectedSession.kdf) {
          continue;
        }

        const email = normalizeEmail(participant.email);
        if (!email || wrappingQueueRef.current.has(email)) {
          continue;
        }

        wrappingQueueRef.current.add(email);
        setWrappingEmails((current) => [...current, email]);

        try {
          const wrapKeyBytes = await derivePbkdf2KeyBytes({
            context: `${email}:${protectedSession.id}`,
            salt: base64UrlToBytes(protectedSession.kdf.salt),
            iterations: protectedSession.kdf.iterations,
          });

          const wrappedSessionKey = await wrapSessionKey({
            sessionKeyBytes: sessionKeyRef.current,
            wrapKeyBytes,
          });

          await api.post(
            `/api/live-sessions/${protectedSession.id}/participants/${encodeURIComponent(email)}/wrap`,
            { wrappedSessionKey }
          );
        } catch (wrapError) {
          setHostError(
            wrapError.response?.data?.message ||
              `Unable to prepare secure access for ${email}`
          );
        } finally {
          wrappingQueueRef.current.delete(email);
          setWrappingEmails((current) => current.filter((item) => item !== email));
        }
      }
    };

    wrapMissingParticipants();
  }, [participants, protectedSession?.id, protectedSession?.status, protectedSession?.kdf]);

  const handleShareModeChange = (mode) => {
    if (hasActiveProtectedSession) {
      return;
    }

    setShareMode(mode);

    if (mode === SHARE_MODE_PROTECTED) {
      const protectedValues = new Set(protectedExpirationOptions.map((o) => o.value));
      if (!protectedValues.has(expirationValue)) {
        setValue("expiration", "5-minutes", { shouldDirty: true });
      }
      setValue("password", "", { shouldDirty: true });
    } else if (!standardExpirationOptions.some((o) => o.value === expirationValue)) {
      setValue("expiration", "1-hour", { shouldDirty: true });
    }
  };

  const filteredSecrets = recentSecrets.filter((secret) =>
    (secret.title || "").toLowerCase().includes(secretSearch.trim().toLowerCase())
  );

  const handleSelectSecret = async (secret) => {
    const secretId = secret._id || secret.id;

    try {
      setLoadingSecretId(secretId);
      setGeneratedLink("");

      const response = await api.get(`/api/encrypted-secrets/${secretId}/decrypt`);
      const decryptedSecret = response.data.secret;

      setSelectedSecretId(secretId);
      setSelectedSecretTitle(decryptedSecret.title);
      setFileAttachment(
        decryptedSecret.type === "file"
          ? {
              name: decryptedSecret.metadata?.originalFileName || decryptedSecret.title,
              contentType:
                decryptedSecret.metadata?.contentType || "application/octet-stream",
              byteLength: decryptedSecret.metadata?.byteLength || 0,
              dataUrl: decryptedSecret.value,
            }
          : null
      );
      setValue("secretName", decryptedSecret.title, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("message", decryptedSecret.type === "file" ? "" : decryptedSecret.value, {
        shouldDirty: true,
        shouldValidate: true,
      });
      showToast("success", "Secret loaded into the form.");
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Unable to load this secret."
      );
    } finally {
      setLoadingSecretId("");
    }
  };

  const createProtectedSession = async (values) => {
    const sessionKeyBytes = createRandomBytes(32);
    const kdfSalt = createRandomBytes(16);
    const expiresAt = getProtectedExpirationDate(values.expiration).toISOString();
    const encryptedPayload = await encryptJsonWithSessionKey({
      sessionKeyBytes,
      payload: {
        title: values.secretName,
        message: values.message || "",
        attachment: fileAttachment,
        createdAt: new Date().toISOString(),
      },
    });

    const response = await api.post("/api/live-sessions", {
      title: values.secretName,
      encryptedPayload,
      expiresAt,
      kdf: {
        algorithm: "PBKDF2-SHA-256",
        salt: bytesToBase64Url(kdfSalt),
        iterations: 210000,
      },
      policy: {
        maxViewCount: 1,
      },
    });

    const createdSession = response.data.session;
    const sessionWithKdf = {
      ...createdSession,
      kdf: {
        algorithm: "PBKDF2-SHA-256",
        salt: bytesToBase64Url(kdfSalt),
        iterations: 210000,
      },
    };

    setProtectedSession(sessionWithKdf);
    setParticipants([]);
    sessionKeyRef.current = sessionKeyBytes;

    const joinUrl = `${window.location.origin}/session/${createdSession.id}`;
    setGeneratedLink(joinUrl);
    showToast("success", "Protected session started.");
  };

  const handleFormSubmit = (event) => {
    void handleSubmit(async (values) => {
      try {
        setGeneratedLink("");
        setHostError("");
        setIsEncrypting(true);

        if (shareMode === SHARE_MODE_PROTECTED) {
          if (!values.message?.trim() && !fileAttachment) {
            showToast("error", "Add a message or attach a file.");
            return;
          }
          await createProtectedSession(values);
          return;
        }

        if (!values.message?.trim() && !fileAttachment) {
          showToast("error", "Add a message or attach a file.");
          return;
        }

        const encryptedShare = await createStandardEncryptedShare({
          secretName: values.secretName,
          message: values.message || "",
          attachment: fileAttachment,
          expiration: values.expiration,
          password: values.password,
          burnAfterReading,
          getExpirationDate: getStandardExpirationDate,
        });

        const response = await api.post("/api/share-links", {
          title: values.secretName,
          encryptedPayload: encryptedShare.encryptedPayload,
          expiresAt: encryptedShare.expiresAt,
          burnAfterReading: encryptedShare.burnAfterReading,
          passwordProtected: encryptedShare.passwordProtected,
          passwordKdf: encryptedShare.passwordKdf,
        });

        const link = `${window.location.origin}/request/${response.data.link.id}#key=${encryptedShare.shareKey}`;
        setGeneratedLink(link);
        showToast("success", "Secure link generated.");
      } catch (error) {
        showToast(
          "error",
          error.response?.data?.message || error.message || "Unable to generate share."
        );
      } finally {
        setIsEncrypting(false);
      }
    }, handleInvalid)(event);
  };

  const endProtectedSession = async () => {
    if (!protectedSession?.id) {
      return;
    }

    try {
      setEndingSession(true);
      setHostError("");

      await api.post(`/api/live-sessions/${protectedSession.id}/end`);
      setProtectedSession((current) => ({
        ...(current || {}),
        status: "ended",
      }));
      sessionKeyRef.current = null;
      showToast("success", "Protected session ended.");
    } catch (endError) {
      setHostError(
        endError.response?.data?.message || "Unable to end protected session"
      );
    } finally {
      setEndingSession(false);
    }
  };

  const handleInvalid = () => {
    showToast("error", "Please fix the highlighted fields.");
  };

  const handleCopy = async () => {
    const linkToCopy =
      shareMode === SHARE_MODE_PROTECTED && protectedJoinUrl
        ? protectedJoinUrl
        : generatedLink;

    if (!linkToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(linkToCopy);
      showToast("success", "Link copied.");
    } catch {
      showToast("error", "Copy failed. Select the link manually.");
    }
  };

  const handleClear = () => {
    if (hasActiveProtectedSession) {
      showToast("error", "End the protected session before clearing.");
      return;
    }

    reset(defaultValues);
    setGeneratedLink("");
    setProtectedSession(null);
    setParticipants([]);
    setHostError("");
    sessionKeyRef.current = null;
    setSelectedSecretId("");
    setSelectedSecretTitle("");
    setFileAttachment(null);
    setBurnAfterReading(false);
    setShareMode(SHARE_MODE_STANDARD);
    showToast("success", "Form cleared.");
  };

  const submitLabel =
    shareMode === SHARE_MODE_PROTECTED
      ? "Start Protected Session"
      : "Generate Secure Link";

  return (
    <div className="sekura-page min-h-[calc(100vh-5rem)]">
      <Toast toast={toast} onDone={() => setToast(null)} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-5xl text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-green-200 bg-green-50 text-green-700 shadow-sm dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
            <ShieldCheck className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="sekura-kicker mt-5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Zero-knowledge share
          </p>
          <h1 className="sekura-heading mt-5 text-4xl font-black tracking-normal sm:text-5xl">
            Create Secure Link
          </h1>
          <p className="sekura-muted mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg">
            Standard links for quick sharing, or protected sessions with OTP and host-controlled access.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            <Card className="p-5 sm:p-7">
              <form
                onSubmit={handleFormSubmit}
                className="space-y-6"
                noValidate
              >
                <ShareModeSelector
                  shareMode={shareMode}
                  onChange={handleShareModeChange}
                  disabled={hasActiveProtectedSession}
                />

                {selectedSecretTitle && (
                  <div className="flex items-center gap-3 rounded-2xl border border-green-300/20 bg-green-300/[0.07] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-300/10 dark:text-green-200">
                      <KeyRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700 dark:text-green-100">
                        Selected secret
                      </p>
                      <p className="sekura-heading mt-1 break-words text-sm font-bold">
                        {selectedSecretTitle}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="secretName">Secret Name</Label>
                    <div className="relative mt-2">
                      <Input
                        id="secretName"
                        placeholder="Enter secret title"
                        aria-invalid={Boolean(errors.secretName)}
                        aria-describedby="secretName-error"
                        className="pl-11"
                        disabled={hasActiveProtectedSession}
                        {...register("secretName")}
                      />
                      <FileLock2
                        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        aria-hidden="true"
                      />
                    </div>
                    <FieldError
                      message={errors.secretName?.message}
                      id="secretName-error"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiration">Expiration Time</Label>
                    <div className="mt-2">
                      <Select
                        id="expiration"
                        aria-invalid={Boolean(errors.expiration)}
                        disabled={hasActiveProtectedSession}
                        {...register("expiration")}
                      >
                        {expirationOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white"
                          >
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <FieldError message={errors.expiration?.message} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Secret Message</Label>
                  <div className="relative mt-2">
                    <Textarea
                      id="message"
                      placeholder="Type your secret message here..."
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby="message-error message-counter"
                      maxLength={1200}
                      disabled={hasActiveProtectedSession}
                      {...register("message")}
                    />
                    <span
                      id="message-counter"
                      className="absolute bottom-3 right-4 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-950/70 dark:text-slate-400"
                    >
                      {messageLength}/1200
                    </span>
                  </div>
                  <FieldError id="message-error" message={errors.message?.message} />
                </div>

                <div className="space-y-3">
                  <label className="sekura-secondary-btn flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition">
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                    Attach File Or Image
                    <input
                      type="file"
                      className="sr-only"
                      disabled={hasActiveProtectedSession}
                      onChange={handleFileAttachment}
                    />
                  </label>

                  {fileAttachment && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-400/20 dark:bg-green-400/10">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 dark:bg-white/10 dark:text-green-200">
                          {fileAttachment.contentType.startsWith("image/") ? (
                            <Image className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <FileLock2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="sekura-heading truncate text-sm font-bold">
                            {fileAttachment.name}
                          </p>
                          <p className="sekura-muted text-xs">
                            {fileAttachment.contentType} - {formatBytes(fileAttachment.byteLength)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={hasActiveProtectedSession}
                        onClick={clearFileAttachment}
                        className="sekura-secondary-btn flex h-9 w-9 items-center justify-center rounded-lg"
                        aria-label="Remove attached file"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {shareMode === SHARE_MODE_STANDARD ? (
                  <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)]">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="password">Password Protection</Label>
                        <span className="text-xs font-medium text-green-700 dark:text-green-200">
                          Optional
                        </span>
                      </div>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Optional password"
                          autoComplete="new-password"
                          className="pr-12"
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-green-50 hover:text-green-700 dark:hover:bg-white/10 dark:hover:text-green-100"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="sekura-surface rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Label htmlFor="burnAfterReading">One-time view</Label>
                          <p className="sekura-muted mt-1 text-sm leading-5">
                            {burnAfterReading
                              ? "The link closes after the first successful reveal."
                              : "Viewers can reopen this link until expiration."}
                          </p>
                        </div>
                        <Switch
                          id="burnAfterReading"
                          checked={burnAfterReading}
                          disabled={hasActiveProtectedSession}
                          onCheckedChange={setBurnAfterReading}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="sekura-surface rounded-lg p-4">
                    <Label>Protected session</Label>
                    <p className="sekura-muted mt-1 text-sm leading-5">
                      Recipients verify email with OTP. You approve access from this page. No decryption key in the URL.
                    </p>
                  </div>
                )}

                {!hasActiveProtectedSession ? (
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Button
                      type="submit"
                      disabled={isEncrypting}
                      className="min-h-12 bg-gradient-to-r from-green-300 via-green-500 to-emerald-300 text-slate-950 shadow-xl shadow-green-500/25 hover:scale-[1.01]"
                    >
                      {isEncrypting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                          {shareMode === SHARE_MODE_PROTECTED
                            ? "Starting..."
                            : "Encrypting"}
                        </>
                      ) : (
                        <>
                          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                          {submitLabel}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleClear}
                      className="min-h-12 sm:min-w-32"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      Clear
                    </Button>
                  </div>
                ) : null}

                <AnimatePresence>
                  {protectedSession ? (
                    <ProtectedSessionPanel
                      session={protectedSession}
                      participants={participants}
                      wrappingEmails={wrappingEmails}
                      joinUrl={protectedJoinUrl}
                      hostError={hostError}
                      ending={endingSession}
                      onEndSession={endProtectedSession}
                      onCopyJoinLink={handleCopy}
                    />
                  ) : null}

                  <GeneratedLinkPreview
                    generatedLink={generatedLink}
                    shareMode={shareMode}
                    onCopy={handleCopy}
                  />
                </AnimatePresence>
              </form>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
          >
            <RecentSecretsPanel
              filteredSecrets={filteredSecrets}
              loadingSecrets={loadingSecrets}
              loadingSecretId={loadingSecretId}
              onSelectSecret={handleSelectSecret}
              searchValue={secretSearch}
              secretsError={secretsError}
              selectedSecretId={selectedSecretId}
              setSearchValue={setSecretSearch}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
