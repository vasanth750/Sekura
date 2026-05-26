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

function StatusCard({ icon: Icon, title, text, tone = "green" }) {
  const toneClass =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-300/25 dark:bg-red-500/10 dark:text-red-100"
      : "border-green-200 bg-green-50 text-green-700 dark:border-green-300/20 dark:bg-green-300/[0.08] dark:text-green-100";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${toneClass}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="sekura-heading font-bold">{title}</p>
        <p className="sekura-muted mt-1 text-sm leading-6">{text}</p>
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
  const [linkExpired, setLinkExpired] = useState(false);

  const expireVisibleSecret = () => {
    setSecret(null);
    setLinkExpired(true);
    setError("This secret link has expired");
  };

  useEffect(() => {
    let isMounted = true;

    const loadSecureLink = async () => {
      try {
        setLoading(true);
        setError("");
        setLinkExpired(false);

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
        const expiryTime = new Date(loadedLink.expiresAt).getTime();

        if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
          throw new Error("This secret link has expired");
        }

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

  useEffect(() => {
    if (!linkData?.expiresAt || linkExpired) {
      return undefined;
    }

    const millisecondsUntilExpiry = Math.max(
      0,
      new Date(linkData.expiresAt).getTime() - Date.now()
    );
    const timeoutId = window.setTimeout(expireVisibleSecret, millisecondsUntilExpiry);

    return () => window.clearTimeout(timeoutId);
  }, [linkData?.expiresAt, linkExpired]);

  const unlockProtectedSecret = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setError("Enter the password for this secure link.");
      return;
    }

    if (linkExpired || (linkData?.expiresAt && new Date(linkData.expiresAt) <= new Date())) {
      expireVisibleSecret();
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
    <div className="sekura-page flex min-h-screen items-center justify-center p-4">
      
      

      <div className="sekura-panel w-full max-w-2xl overflow-hidden rounded-xl">
        <div className="border-b border-green-200 bg-green-50 p-7 dark:border-green-400/20 dark:bg-green-400/10 md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-green-200 bg-white p-3 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300">
              <ShieldCheck size={34} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700 dark:text-green-300">Secure Link</p>
              <h1 className="mt-1 text-3xl font-black">Sekura Secret</h1>
              <p className="sekura-muted mt-1 text-sm md:text-base">This secret decrypts locally in your browser.</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-green-200" aria-hidden="true" />
              <p className="sekura-heading mt-4 font-semibold">Opening secure link...</p>
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
                <label className="sekura-heading mb-2 block text-sm font-semibold">Requested Secret</label>
                <input type="text" value={collectionRequest.title} disabled className="sekura-input w-full rounded-lg px-4 py-4 font-medium opacity-70" />
              </div>
              <div>
                <label className="sekura-heading mb-2 block text-sm font-semibold">Enter Secret</label>
                <div className="relative">
                  <input type={showCollectionSecret ? "text" : "password"} placeholder="Enter the requested secret" value={collectionSecretValue} onChange={(event) => {
                    setCollectionSecretValue(event.target.value);
                    setError("");
                  }} className="sekura-input w-full rounded-lg px-4 py-4 pr-14 outline-none transition" />
                  <button type="button" className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-green-100" onClick={() => setShowCollectionSecret((current) => !current)} aria-label={showCollectionSecret ? "Hide secret" : "Show secret"}>
                    {showCollectionSecret ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={!collectionSecretValue.trim() || submittingCollection} className="sekura-primary-btn flex w-full items-center justify-center gap-2 rounded-lg py-4 text-lg font-bold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
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
              <h2 className="sekura-heading text-3xl font-black">Secret Submitted</h2>
              <p className="sekura-muted mt-3 max-w-md">Your secret was encrypted and added to the requester&apos;s dashboard and credential registry.</p>
            </div>
          )}

          {!loading && linkData?.passwordProtected && !secret && !linkExpired && (
            <form onSubmit={unlockProtectedSecret} className="space-y-5">
              <StatusCard icon={KeyRound} title="Password Required" text="This link needs both the URL key and the sender's password before it can decrypt." />
              <div>
                <label className="sekura-heading mb-2 block text-sm font-semibold" htmlFor="sharePassword">Secure link password</label>
                <div className="relative">
                  <input id="sharePassword" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" className="sekura-input w-full rounded-lg px-4 py-4 pr-14 outline-none transition" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-green-100" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={decrypting} className="sekura-primary-btn flex w-full items-center justify-center gap-2 rounded-lg py-4 text-lg font-bold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">
                {decrypting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <LockKeyhole className="h-5 w-5" aria-hidden="true" />}
                {decrypting ? "Decrypting..." : "Unlock Secret"}
              </button>
            </form>
          )}

          {!loading && secret && !linkExpired && (
            <div className="space-y-5">
              <StatusCard icon={CheckCircle2} title="Secret Decrypted" text="The server sent encrypted data only. Your browser used the URL key to reveal it here." />
              <div className="sekura-surface rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-100">Secret Name</p>
                <h2 className="sekura-heading mt-2 break-words text-2xl font-black">{secret.title || linkData.title}</h2>
              </div>
              <div className="sekura-surface rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-100">Secret Message</p>
                <pre className="sekura-input mt-3 whitespace-pre-wrap break-words rounded-lg p-4 font-sans text-base leading-7">{secret.message}</pre>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatusCard icon={Clock} title="Expires" text={new Date(linkData.expiresAt).toLocaleString()} />
                <StatusCard icon={LockKeyhole} title="Access Window" text="This link remains readable until expiration." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
