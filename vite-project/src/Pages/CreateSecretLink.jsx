import { useEffect, useState } from "react";
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
  KeyRound,
  Link2,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

const expirationOptions = [
  { value: "5-minutes", label: "5 Minutes" },
  { value: "1-hour", label: "1 Hour" },
  { value: "24-hours", label: "24 Hours" },
  { value: "7-days", label: "7 Days" },
];

const expirationDurations = {
  "5-minutes": 5 * 60 * 1000,
  "1-hour": 60 * 60 * 1000,
  "24-hours": 24 * 60 * 60 * 1000,
  "7-days": 7 * 24 * 60 * 60 * 1000,
};

const passwordKdfIterations = 210000;

const formSchema = z.object({
  secretName: z
    .string()
    .trim()
    .min(3, "Secret name must be at least 3 characters."),
  message: z
    .string()
    .trim()
    .min(5, "Secret message must be at least 5 characters."),
  expiration: z.string().min(1, "Choose an expiration time."),
  password: z.string().optional(),
});

const defaultValues = {
  secretName: "",
  message: "",
  expiration: "1-hour",
  password: "",
};

const particles = Array.from({ length: 22 }, (_, index) => ({
  left: `${(index * 29 + 7) % 100}%`,
  top: `${(index * 43 + 13) % 100}%`,
  size: 2 + (index % 4),
  delay: (index % 7) * 0.35,
  duration: 5 + (index % 5),
}));

function bytesToBase64Url(bytes) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createRandomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return bytes;
}

function getExpirationDate(expiration) {
  const duration = expirationDurations[expiration] || expirationDurations["1-hour"];

  return new Date(Date.now() + duration);
}

async function derivePasswordKey(password, salt, iterations) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derivedBits);
}

async function createEncryptionKeyBytes(linkKeyBytes, password, passwordKdf) {
  if (!password) {
    return linkKeyBytes;
  }

  const passwordKeyBytes = await derivePasswordKey(
    password,
    passwordKdf.saltBytes,
    passwordKdf.iterations
  );
  const combinedKeyMaterial = new Uint8Array(
    linkKeyBytes.length + passwordKeyBytes.length
  );

  combinedKeyMaterial.set(linkKeyBytes);
  combinedKeyMaterial.set(passwordKeyBytes, linkKeyBytes.length);

  const combinedDigest = await crypto.subtle.digest(
    "SHA-256",
    combinedKeyMaterial
  );

  return new Uint8Array(combinedDigest);
}

async function createEncryptedShare(values) {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto is not available in this browser.");
  }

  const linkKeyBytes = createRandomBytes(32);
  const iv = createRandomBytes(12);
  const password = values.password?.trim();
  const passwordProtected = Boolean(password);
  const passwordKdf = passwordProtected
    ? {
        algorithm: "PBKDF2-SHA-256",
        saltBytes: createRandomBytes(16),
        iterations: passwordKdfIterations,
      }
    : null;
  const encryptionKeyBytes = await createEncryptionKeyBytes(
    linkKeyBytes,
    password,
    passwordKdf
  );
  const key = await crypto.subtle.importKey(
    "raw",
    encryptionKeyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const encoder = new TextEncoder();
  const payload = encoder.encode(
    JSON.stringify({
      title: values.secretName,
      message: values.message,
      expiration: values.expiration,
      passwordProtected,
      burnAfterReading: false,
      createdAt: new Date().toISOString(),
    })
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    payload
  );

  return {
    encryptedPayload: {
      algorithm: "AES-GCM",
      iv: bytesToBase64Url(iv),
      ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
      encoding: "base64url",
    },
    expiresAt: getExpirationDate(values.expiration).toISOString(),
    burnAfterReading: false,
    passwordProtected,
    passwordKdf: passwordKdf
      ? {
          algorithm: passwordKdf.algorithm,
          salt: bytesToBase64Url(passwordKdf.saltBytes),
          iterations: passwordKdf.iterations,
        }
      : undefined,
    shareKey: bytesToBase64Url(linkKeyBytes),
  };
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
      ? "border-red-400/40 bg-red-500/15 text-red-100"
      : "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";

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
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
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
      className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border border-green-300/20 bg-white p-3 shadow-xl shadow-green-500/10"
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
    <p id={id} className="mt-2 text-sm font-medium text-red-300" role="alert">
      {message}
    </p>
  );
}

function GeneratedLinkPreview({ generatedLink, onCopy }) {
  if (!generatedLink) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-5"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-300 via-emerald-300 to-green-500" />
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="sekura-heading text-lg font-bold">
            Secure Link Ready
          </h2>
          <p className="sekura-muted text-sm">
            Share it through a trusted channel.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Label htmlFor="generatedLink">Generated secure link</Label>
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
            className="bg-white text-slate-950 hover:bg-green-100 lg:min-w-28"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <QrPreview value={generatedLink} />
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-amber-100">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold leading-6">
            Anyone with this link can access the secret.
          </p>
        </div>
      </div>
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
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-400/10 text-green-200">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="sekura-heading text-lg font-bold">
            Recent Secrets
          </h2>
          <p className="sekura-muted text-sm">
            Pick from your 5 latest secrets or search.
          </p>
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
          <div className="rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
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
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Loading
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" aria-hidden="true" />
                        Create Link
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

  const showToast = (type, message) => {
    setToast({ type, message });
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

  const filteredSecrets = recentSecrets.filter((secret) =>
    (secret.title || "")
      .toLowerCase()
      .includes(secretSearch.trim().toLowerCase())
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
      setValue("secretName", decryptedSecret.title, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("message", decryptedSecret.value, {
        shouldDirty: true,
        shouldValidate: true,
      });
      showToast("success", "Secret loaded into the create link form.");
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Unable to load this secret."
      );
    } finally {
      setLoadingSecretId("");
    }
  };

  const onSubmit = async (values) => {
    try {
      setGeneratedLink("");
      setIsEncrypting(true);

      const encryptedShare = await createEncryptedShare(values);
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
        error.message || "Unable to generate a secure link."
      );
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleInvalid = () => {
    showToast("error", "Please fix the highlighted fields.");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      showToast("success", "Link copied.");
    } catch {
      showToast("error", "Copy failed. Select the link manually.");
    }
  };

  const handleClear = () => {
    reset(defaultValues);
    setGeneratedLink("");
    setSelectedSecretId("");
    setSelectedSecretTitle("");
    showToast("success", "Form cleared.");
  };

  return (
    <div className="sekura-page min-h-[calc(100vh-5rem)]">
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="hidden"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1], y: [-8, 12, -8] }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

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
            Sekura Secret Link
          </h1>
          <p className="sekura-muted mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg">
            Share secrets securely with end-to-end encryption. The server stores ciphertext only.
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
                onSubmit={handleSubmit(onSubmit, handleInvalid)}
                className="space-y-6"
                noValidate
              >
                {selectedSecretTitle && (
                  <div className="flex items-center gap-3 rounded-2xl border border-green-300/20 bg-green-300/[0.07] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-300/10 text-green-200">
                      <KeyRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-100">
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

                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)]">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="password">Password Protection</Label>
                      <span className="text-xs font-medium text-green-200">
                        Add extra protection
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
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-green-50 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:hover:bg-white/10 dark:hover:text-green-100 dark:focus-visible:ring-green-300"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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
                    <Label>Access Window</Label>
                    <p className="sekura-muted mt-1 text-sm leading-5">
                      Viewers can reopen this link until its expiration time.
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200">
                      Reusable until expiration
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Button
                    type="submit"
                    disabled={isEncrypting}
                    className="min-h-12 bg-gradient-to-r from-green-300 via-green-500 to-emerald-300 text-slate-950 shadow-xl shadow-green-500/25 hover:scale-[1.01] hover:from-green-200 hover:via-green-400 hover:to-emerald-200"
                  >
                    {isEncrypting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        Encrypting
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                        Generate Secure Link
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

                <AnimatePresence>
                  <GeneratedLinkPreview
                    generatedLink={generatedLink}
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
