import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../api";

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getFragmentKey() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return params.get("key") || "";
}

async function derivePasswordKey(password, salt, iterations) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256);

  return new Uint8Array(derivedBits);
}

async function createDecryptionKeyBytes(shareKey, password, passwordKdf) {
  const linkKeyBytes = base64UrlToBytes(shareKey);

  if (!passwordKdf) {
    return linkKeyBytes;
  }

  const passwordKeyBytes = await derivePasswordKey(password, base64UrlToBytes(passwordKdf.salt), passwordKdf.iterations);
  const combinedKeyMaterial = new Uint8Array(linkKeyBytes.length + passwordKeyBytes.length);

  combinedKeyMaterial.set(linkKeyBytes);
  combinedKeyMaterial.set(passwordKeyBytes, linkKeyBytes.length);

  const combinedDigest = await crypto.subtle.digest("SHA-256", combinedKeyMaterial);

  return new Uint8Array(combinedDigest);
}

async function decryptSecureLink(link, shareKey, password) {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto is not available in this browser.");
  }

  const keyBytes = await createDecryptionKeyBytes(shareKey, password, link.passwordKdf);
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64UrlToBytes(link.encryptedPayload.iv) }, key, base64UrlToBytes(link.encryptedPayload.ciphertext));
  const decoded = new TextDecoder().decode(plaintext);

  return JSON.parse(decoded);
}

async function markSecureLinkOpened(id) {
  await api.post(`/api/share-links/${id}/open`);
}

function StatusCard({ icon: Icon, title, text, tone = "cyan" }) {
  const toneClass = tone === "red" ? "border-red-300/25 bg-red-500/10 text-red-100" : "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-100";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${toneClass}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-bold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
      </div>
    </div>
  );
}

export default function RequestPage() {
  const { id } = useParams();
  const [linkData, setLinkData] = useState(null);
  const [secret, setSecret] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [collectionRequest, setCollectionRequest] = useState(null);
  const [collectionSecretValue, setCollectionSecretValue] = useState("");
  const [showCollectionSecret, setShowCollectionSecret] = useState(false);
  const [collectionSubmitted, setCollectionSubmitted] = useState(false);
  const [submittingCollection, setSubmittingCollection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSecureLink = async () => {
      try {
        setLoading(true);
        setError("");

        const shareKey = getFragmentKey();
        const searchParams = new URLSearchParams(window.location.search);

        if (!shareKey && searchParams.get("type") === "collect") {
          const response = await api.get(`/api/secret-requests/${id}`);

          if (!isMounted) {
            return;
          }

          setCollectionRequest(response.data.request);
          setCollectionSubmitted(response.data.request.status === "submitted");
          return;
        }

        if (!shareKey) {
          throw new Error("The decryption key is missing from this link.");
        }

        const response = await api.get(`/api/share-links/${id}`);
        const loadedLink = response.data.link;

        if (!isMounted) {
          return;
        }

        setLinkData(loadedLink);

        if (!loadedLink.passwordProtected) {
          const decryptedSecret = await decryptSecureLink(loadedLink, shareKey, "");

          if (isMounted) {
            await markSecureLinkOpened(id);
            setSecret(decryptedSecret);
          }
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || requestError.message || "Unable to open this secure link.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSecureLink();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const unlockProtectedSecret = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setError("Enter the password for this secure link.");
      return;
    }

    try {
      setDecrypting(true);
      setError("");

      const decryptedSecret = await decryptSecureLink(linkData, getFragmentKey(), password.trim());

      await markSecureLinkOpened(id);
      setSecret(decryptedSecret);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to decrypt this secret. Check the link and password."
      );
    } finally {
      setDecrypting(false);
    }
  };

  const submitRequestedSecret = async (event) => {
    event.preventDefault();

    if (!collectionSecretValue.trim()) {
      setError("Enter the requested secret before submitting.");
      return;
    }

    try {
      setSubmittingCollection(true);
      setError("");

      await api.post(`/api/secret-requests/${id}/submit`, {
        value: collectionSecretValue,
      });

      setCollectionSubmitted(true);
      setCollectionSecretValue("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to submit this secret."
      );
    } finally {
      setSubmittingCollection(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.13),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-cyan-300/10 p-7 text-white md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-cyan-100">
              <ShieldCheck size={34} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">Secure Link</p>
              <h1 className="mt-1 text-3xl font-black">Sekura Secret</h1>
              <p className="mt-1 text-sm text-slate-400 md:text-base">This secret decrypts locally in your browser.</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-200" aria-hidden="true" />
              <p className="mt-4 font-semibold text-white">Opening secure link...</p>
            </div>
          )}

          {!loading && error && !secret && !collectionRequest && (
            <StatusCard icon={AlertTriangle} title="Unable To Open Secret" text={error} tone="red" />
          )}

          {!loading && collectionRequest && !collectionSubmitted && (
            <form onSubmit={submitRequestedSecret} className="space-y-6">
              <StatusCard icon={ShieldCheck} title="Protected Collection" text="Submit the requested secret. It will be encrypted into the requester's credential registry." />
              {error && (
                <StatusCard icon={AlertTriangle} title="Submission Failed" text={error} tone="red" />
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">Requested Secret</label>
                <input type="text" value={collectionRequest.title} disabled className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 font-medium text-slate-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100">Enter Secret</label>
                <div className="relative">
                  <input type={showCollectionSecret ? "text" : "password"} placeholder="Enter the requested secret" value={collectionSecretValue} onChange={(event) => {
                    setCollectionSecretValue(event.target.value);
                    setError("");
                  }} className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 pr-14 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25" />
                  <button type="button" className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-cyan-100" onClick={() => setShowCollectionSecret((current) => !current)} aria-label={showCollectionSecret ? "Hide secret" : "Show secret"}>
                    {showCollectionSecret ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={!collectionSecretValue.trim() || submittingCollection} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-4 text-lg font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
                {submittingCollection && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                {submittingCollection ? "Submitting..." : "Submit Secret Securely"}
              </button>
            </form>
          )}

          {!loading && collectionRequest && collectionSubmitted && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10">
                <ShieldCheck size={40} className="text-emerald-200" />
              </div>
              <h2 className="text-3xl font-black text-white">Secret Submitted</h2>
              <p className="mt-3 max-w-md text-slate-400">Your secret was encrypted and added to the requester&apos;s dashboard and credential registry.</p>
            </div>
          )}

          {!loading && linkData?.passwordProtected && !secret && (
            <form onSubmit={unlockProtectedSecret} className="space-y-5">
              <StatusCard icon={KeyRound} title="Password Required" text="This link needs both the URL key and the sender's password before it can decrypt." />
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-100" htmlFor="sharePassword">Secure link password</label>
                <div className="relative">
                  <input id="sharePassword" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 pr-14 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-cyan-100" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={decrypting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 py-4 text-lg font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">
                {decrypting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <LockKeyhole className="h-5 w-5" aria-hidden="true" />}
                {decrypting ? "Decrypting..." : "Unlock Secret"}
              </button>
            </form>
          )}

          {!loading && secret && (
            <div className="space-y-5">
              <StatusCard icon={CheckCircle2} title="Secret Decrypted" text="The server sent encrypted data only. Your browser used the URL key to reveal it here." />
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Secret Name</p>
                <h2 className="mt-2 break-words text-2xl font-black text-white">{secret.title || linkData.title}</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Secret Message</p>
                <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/25 p-4 font-sans text-base leading-7 text-slate-100">{secret.message}</pre>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatusCard icon={Clock} title="Expires" text={new Date(linkData.expiresAt).toLocaleString()} />
                <StatusCard icon={LockKeyhole} title="Burn Mode" text={linkData.burnAfterReading ? "This link is now consumed after this access." : "This link remains readable until expiration."} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
