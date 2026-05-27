import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, Download, Eye, EyeOff, FileText, Image, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  base64UrlToBytes,
  decryptJsonWithSessionKey,
  derivePbkdf2KeyBytes,
  normalizeEmail,
  unwrapSessionKey,
} from "../lib/liveSessionCrypto";
import { downloadDataUrl, formatBytes, isImageType } from "../lib/attachments";

const pollIntervalMs = 4000;

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

export default function LiveSessionJoin() {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [participantToken, setParticipantToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState("");
  const [sessionPackage, setSessionPackage] = useState(null);
  const [secret, setSecret] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [waitingForHost, setWaitingForHost] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");
  const [opened, setOpened] = useState(false);

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);

  const requestHeaders = useMemo(() => {
    if (!participantToken) {
      return undefined;
    }

    return {
      Authorization: `Bearer ${participantToken}`,
    };
  }, [participantToken]);

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setClosedMessage("");

      await api.post(`/api/live-sessions/${id}/send-otp`, {
        email: normalizedEmail,
      });

      setOtpSent(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setClosedMessage("");

      const response = await api.post(`/api/live-sessions/${id}/verify-otp`, {
        email: normalizedEmail,
        otp,
      });

      setParticipantToken(response.data.participantToken);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const decryptPackage = async (pkg) => {
    const wrapKeyBytes = await derivePbkdf2KeyBytes({
      context: `${normalizedEmail}:${id}`,
      salt: base64UrlToBytes(pkg.kdf.salt),
      iterations: pkg.kdf.iterations,
    });
    const sessionKeyBytes = await unwrapSessionKey({
      wrappedSessionKey: pkg.wrappedSessionKey,
      wrapKeyBytes,
    });

    return decryptJsonWithSessionKey({
      sessionKeyBytes,
      encryptedPayload: pkg.encryptedPayload,
    });
  };

  useEffect(() => {
    if (!participantToken || closedMessage || opened) {
      return undefined;
    }

    let cancelled = false;

    const loadPackage = async () => {
      try {
        const response = await api.get(`/api/live-sessions/${id}/package`, {
          headers: requestHeaders,
          validateStatus: (status) =>
            [200, 202, 403, 410, 423].includes(status),
        });

        if (cancelled) {
          return;
        }

        if (response.status === 202) {
          setWaitingForHost(true);
          return;
        }

        if (response.status === 410 || response.status === 423) {
          setClosedMessage(response.data.message || "This live session is closed");
          return;
        }

        if (response.status === 403) {
          setError(response.data.message || "Access denied for this live session");
          return;
        }

        setWaitingForHost(false);
        setSessionPackage(response.data);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load live session package"
          );
        }
      }
    };

    loadPackage();
    const intervalId = window.setInterval(loadPackage, pollIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [participantToken, id, requestHeaders, closedMessage, opened]);

  const unlockSecret = async () => {
    if (!sessionPackage) {
      return;
    }

    try {
      setDecrypting(true);
      setError("");
      const decrypted = await decryptPackage(sessionPackage);
      setSecret(decrypted);
      setShowSecret(true);

      await api.post(
        `/api/live-sessions/${id}/open`,
        {},
        {
          headers: requestHeaders,
        }
      );
      setOpened(true);
    } catch (unlockError) {
      setError(
        unlockError.response?.data?.message ||
          "Unable to decrypt this live session payload"
      );
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <div className="sekura-page flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl p-6 md:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl border border-green-300/20 bg-green-400/10 p-3 text-green-300">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-300">
              Live Zero-Trust Session
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-100">
              Secure Access Portal
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Verify your email with OTP. The secret decrypts locally in your browser.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
            {error}
          </div>
        ) : null}

        {closedMessage ? (
          <div className="mb-5 rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
            {closedMessage}
          </div>
        ) : null}

        {!participantToken ? (
          <div className="space-y-5">
            <div>
              <Label htmlFor="participantEmail">Email</Label>
              <Input
                id="participantEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
              />
            </div>

            {!otpSent ? (
              <Button
                type="button"
                onClick={sendOtp}
                disabled={loading || !normalizedEmail}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending OTP
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4" />
                    Send OTP
                  </>
                )}
              </Button>
            ) : (
              <>
                <div>
                  <Label htmlFor="participantOtp">OTP</Label>
                  <Input
                    id="participantOtp"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter 6 digit code"
                    maxLength={6}
                  />
                </div>

                <Button
                  type="button"
                  onClick={verifyOtp}
                  disabled={loading || otp.trim().length !== 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        ) : null}

        {participantToken && waitingForHost && !sessionPackage && !closedMessage ? (
          <div className="rounded-xl border border-blue-300/20 bg-blue-500/10 px-4 py-4 text-sm font-semibold text-blue-100">
            Waiting for host approval and secure key preparation...
          </div>
        ) : null}

        {sessionPackage && !secret && !closedMessage ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4 text-sm text-slate-300">
              <p>
                Session expires at:{" "}
                <span className="font-semibold">{formatDate(sessionPackage.session.expiresAt)}</span>
              </p>
            </div>
            <Button type="button" onClick={unlockSecret} disabled={decrypting} className="w-full">
              {decrypting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Decrypting
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Unlock Secret
                </>
              )}
            </Button>
          </div>
        ) : null}

        {secret ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              Secret decrypted locally. This view is temporary.
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Title</p>
              <p className="mt-2 text-lg font-bold text-slate-100">{secret.title}</p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Secret</p>
                <button
                  type="button"
                  onClick={() => setShowSecret((current) => !current)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-300"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showSecret ? "Hide" : "Show"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                {showSecret ? secret.message : "••••••••••••••••••••"}
              </pre>
            </div>

            {secret.attachment ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Attachment</p>
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-300/10 text-green-200">
                    {isImageType(secret.attachment.contentType) ? (
                      <Image className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-100">
                      {secret.attachment.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {secret.attachment.contentType} - {formatBytes(secret.attachment.byteLength)}
                    </p>
                  </div>
                </div>
                {isImageType(secret.attachment.contentType) ? (
                  <img
                    src={secret.attachment.dataUrl}
                    alt={secret.attachment.name}
                    className="mt-3 max-h-72 w-full rounded-lg border border-slate-700 object-contain"
                  />
                ) : null}
                <Button
                  type="button"
                  onClick={() =>
                    downloadDataUrl(
                      secret.attachment.dataUrl,
                      secret.attachment.name,
                      secret.attachment.contentType
                    )
                  }
                  className="mt-3 w-full"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                <p className="inline-flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4 text-green-300" />
                  Expires
                </p>
                <p className="mt-2 text-xs">{formatDate(sessionPackage.session.expiresAt)}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                <p className="inline-flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-green-300" />
                  Policy
                </p>
                <p className="mt-2 text-xs">
                  Max views: {sessionPackage.session.policy?.maxViewCount || 1}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!participantToken && !error && !closedMessage ? (
          <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            <span className="inline-flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Access requires OTP verification for this live session.
            </span>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
