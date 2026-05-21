import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import { z } from "zod";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FileLock2,
  Flame,
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
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";

const expirationOptions = [
  { value: "5-minutes", label: "5 Minutes" },
  { value: "1-hour", label: "1 Hour" },
  { value: "24-hours", label: "24 Hours" },
  { value: "7-days", label: "7 Days" },
  { value: "one-time", label: "One Time View" },
];

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
  burnAfterReading: z.boolean(),
});

const defaultValues = {
  secretName: "",
  message: "",
  expiration: "1-hour",
  password: "",
  burnAfterReading: true,
};

const processSteps = [
  {
    title: "Encrypt Secret Locally",
    description: "AES-GCM is prepared in your browser.",
    icon: LockKeyhole,
  },
  {
    title: "Generate Secure Key",
    description: "A random key is created client-side.",
    icon: KeyRound,
  },
  {
    title: "Create Shareable Link",
    description: "The key stays in the URL fragment.",
    icon: Link2,
  },
];

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

async function createEncryptedShare(values) {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto is not available in this browser.");
  }

  const keyBytes = createRandomBytes(32);
  const iv = createRandomBytes(12);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
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
      passwordProtected: Boolean(values.password),
      burnAfterReading: values.burnAfterReading,
      createdAt: new Date().toISOString(),
    })
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    payload
  );
  const digest = await crypto.subtle.digest("SHA-256", ciphertext);
  const secretId = bytesToBase64Url(new Uint8Array(digest)).slice(0, 24);
  const shareKey = bytesToBase64Url(keyBytes);
  const ivToken = bytesToBase64Url(iv);

  return `${window.location.origin}/request/${secretId}?iv=${ivToken}#key=${shareKey}`;
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
      className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border border-cyan-300/20 bg-white p-3 shadow-xl shadow-cyan-500/10"
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

function ProcessTimeline({ activeStep, completed }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {processSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isDone = completed || index < activeStep;
        const isActive = !completed && index === activeStep;

        return (
          <motion.div
            key={step.title}
            animate={{
              borderColor: isActive || isDone ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.1)",
              backgroundColor: isActive || isDone ? "rgba(8,145,178,0.16)" : "rgba(15,23,42,0.45)",
            }}
            className="rounded-xl border p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
                {isDone ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <StepIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
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
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400" />
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Secure Link Ready
          </h2>
          <p className="text-sm text-slate-400">
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
            className="bg-white text-slate-950 hover:bg-cyan-100 lg:min-w-28"
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
  return (
    <Card className="p-5 sm:p-6 lg:sticky lg:top-28">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Recent Secrets
          </h2>
          <p className="text-sm text-slate-400">
            Pick a saved secret to prepare a link.
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
          placeholder="Search recent secrets..."
          className="pl-11"
          aria-label="Search recent secrets"
        />
      </div>

      <div className="mt-5 space-y-3">
        {loadingSecrets && (
          <div className="rounded-xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-400">
            Loading recent secrets...
          </div>
        )}

        {secretsError && (
          <div className="rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
            {secretsError}
          </div>
        )}

        {!loadingSecrets && !secretsError && filteredSecrets.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-950/45 px-4 py-5 text-center text-sm text-slate-400">
            No matching secrets found.
          </div>
        )}

        {!loadingSecrets &&
          !secretsError &&
          filteredSecrets.map((secret) => {
            const secretId = secret._id || secret.id;
            const isSelected = selectedSecretId === secretId;
            const isLoading = loadingSecretId === secretId;

            return (
              <div
                key={secretId}
                className={`rounded-xl border p-4 transition ${
                  isSelected
                    ? "border-cyan-300/40 bg-cyan-300/10"
                    : "border-white/10 bg-slate-950/45 hover:border-cyan-300/25"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-words text-sm font-bold text-white">
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
  const [activeStep, setActiveStep] = useState(0);
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
  const burnAfterReading = useWatch({ control, name: "burnAfterReading" });
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
            error.response?.data?.message || "Unable to load recent secrets."
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
      setActiveStep(0);

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

      for (let step = 0; step < processSteps.length; step += 1) {
        setActiveStep(step);
        await new Promise((resolve) => window.setTimeout(resolve, 420));
      }

      const link = await createEncryptedShare(values);
      setGeneratedLink(link);
      setActiveStep(processSteps.length);
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
    setActiveStep(0);
    setSelectedSecretId("");
    setSelectedSecretTitle("");
    showToast("success", "Form cleared.");
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className="absolute -z-10 rounded-full bg-cyan-200/60 shadow-[0_0_18px_rgba(34,211,238,0.6)]"
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-2xl shadow-cyan-500/20">
            <ShieldCheck className="h-8 w-8 text-cyan-200" aria-hidden="true" />
          </div>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Zero-knowledge share
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-normal text-white sm:text-5xl">
            Sekura Secret Link
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Share secrets securely with end-to-end encryption. Nothing is stored permanently.
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
                  <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                      <KeyRound className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                        Selected secret
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-white">
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
                            className="bg-slate-950 text-white"
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
                      className="absolute bottom-3 right-4 rounded-full bg-slate-950/70 px-2 py-1 text-xs font-semibold text-slate-400"
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
                      <span className="text-xs font-medium text-cyan-200">
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
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
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

                  <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label htmlFor="burnAfterReading">
                          Burn After Reading
                        </Label>
                        <p className="mt-1 text-sm leading-5 text-slate-400">
                          Delete the secret permanently after first access
                        </p>
                      </div>
                      <Controller
                        name="burnAfterReading"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="burnAfterReading"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label="Toggle burn after reading"
                          />
                        )}
                      />
                    </div>
                    <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200">
                      <Flame className="h-4 w-4" aria-hidden="true" />
                      {burnAfterReading ? "Auto-destroy enabled" : "Reusable until expiration"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-cyan-200" aria-hidden="true" />
                    <h2 className="text-base font-bold text-white">
                      Encryption Flow
                    </h2>
                  </div>
                  <ProcessTimeline
                    activeStep={activeStep}
                    completed={Boolean(generatedLink)}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Button
                    type="submit"
                    disabled={isEncrypting}
                    className="min-h-12 bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 text-slate-950 shadow-xl shadow-cyan-500/25 hover:scale-[1.01] hover:from-cyan-200 hover:via-blue-300 hover:to-emerald-200"
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
