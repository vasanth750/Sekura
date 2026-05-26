import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, ImageOff, LogOut, Mail, ShieldCheck, UserRound, X } from "lucide-react";
import defaultProfile from "../../assets/acc.jpeg";

function ProfileTriggerButton({ image, onOpen }) {
  return (
    <button type="button" onClick={onOpen} className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-0.5 shadow-sm transition-all duration-200 hover:border-green-200 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-green-300/40" aria-label="Open profile">
      <span className="absolute inset-0 rounded-full bg-green-100 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-green-300/10" aria-hidden="true" />
      <img src={image} alt="Profile" className="relative z-10 h-full w-full rounded-full object-cover" />
    </button>
  );
}

function ProfileInfoCard({ icon: Icon, label, value }) {
  return (
    <div className="sekura-surface group rounded-xl p-5 transition-all duration-200 hover:border-green-200 hover:bg-green-50 dark:hover:border-green-300/30 dark:hover:bg-green-300/[0.055]">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700 transition-all duration-200 dark:border-green-300/10 dark:bg-green-300/10 dark:text-green-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="sekura-heading mt-2 break-words text-sm font-bold leading-6">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SecurityStatusCard() {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5 transition-all duration-200 dark:border-green-300/25 dark:bg-green-300/[0.07]">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-green-200 bg-white text-green-700 dark:border-green-300/20 dark:bg-green-300/10 dark:text-green-300">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="sekura-heading font-bold">Zero-Knowledge Security</p>
          <p className="sekura-muted mt-1 text-sm leading-6">Your secrets are encrypted locally before sharing.</p>
        </div>
      </div>
    </div>
  );
}

function ProfileBackdrop({ onClose }) {
  return (
    <button
      type="button"
      aria-label="Close profile"
      onMouseDown={onClose}
      className="sekura-profile-backdrop fixed inset-0 z-[90] cursor-default border-0 p-0 animate-[sekuraBackdropFade_300ms_ease-out]"
    />
  );
}

function ProfileDrawer({
  fileInputRef,
  handleImageChange,
  handleLogout,
  onClose,
  profileImage,
  removeProfilePhoto,
  user,
}) {
  return (
    <aside onMouseDown={(event) => event.stopPropagation()} className="fixed inset-y-0 right-0 z-[100] flex h-screen min-h-screen w-[min(100vw,420px)] flex-col overflow-hidden rounded-l-2xl border-l border-slate-200 bg-white text-slate-950 shadow-[-28px_0_70px_rgba(15,23,42,0.16)] animate-[sekuraSidebarSlide_300ms_ease-out] dark:border-white/10 dark:bg-slate-950 dark:text-slate-100" aria-label="Profile sidebar">
      <div className="h-1 w-full bg-green-600" />

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-950">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-700 dark:text-green-300">Profile</p>
          <h2 className="sekura-heading mt-1 text-2xl font-black tracking-normal">Account Settings</h2>
        </div>

        <button type="button" onClick={onClose} className="sekura-secondary-btn flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500" aria-label="Close profile">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-7 dark:bg-slate-950">
        <div className="sekura-panel rounded-xl p-6 text-center transition-all duration-200 hover:border-green-200 dark:hover:border-green-300/40">
          <div className="relative mx-auto h-32 w-32">
            <img src={profileImage} alt="Profile" className="h-full w-full rounded-full border-4 border-green-200/80 object-cover shadow-[0_0_35px_rgba(34,197,94,0.34)] transition-transform duration-300 hover:scale-[1.03]" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border border-green-100/80 bg-green-300 text-slate-950 shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-110 hover:bg-green-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-100" aria-label="Upload profile photo">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

          <p className="sekura-muted mt-5 text-sm font-semibold">Add your profile photo</p>

          <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="sekura-primary-btn flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
              <Camera className="h-4 w-4" aria-hidden="true" />
              Change Photo
            </button>

            <button type="button" onClick={removeProfilePhoto} className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-300/25 bg-red-500/10 text-red-200 transition-all duration-300 hover:scale-105 hover:border-red-300/40 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300" aria-label="Remove profile photo">
              <ImageOff className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <ProfileInfoCard icon={UserRound} label="Username" value={user?.name || "User"} />
          <ProfileInfoCard icon={Mail} label="Email" value={user?.email || "user@gmail.com"} />
          <SecurityStatusCard />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950">
        <button type="button" onClick={handleLogout} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-4 font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default function ProfileButton({ profileOpen, setProfileOpen, user, logout }) {
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || defaultProfile);
  const portalReady = typeof document !== "undefined";

  useEffect(() => {
    document.documentElement.classList.toggle("sekura-profile-open", profileOpen);
    document.body.style.overflow = profileOpen ? "hidden" : "";

    return () => {
      document.documentElement.classList.remove("sekura-profile-open");
      document.body.style.overflow = "";
    };
  }, [profileOpen]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profileImage", reader.result);
    };

    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    setProfileImage(defaultProfile);
    localStorage.removeItem("profileImage");
  };

  const handleLogout = () => {
    localStorage.removeItem("profileImage");
    setProfileOpen(false);
    logout();
  };

  return (
    <>
      <ProfileTriggerButton image={profileImage} onOpen={() => setProfileOpen(true)} />

      {profileOpen && portalReady && createPortal(
        <>
          <ProfileBackdrop onClose={() => setProfileOpen(false)} />
          <ProfileDrawer
            fileInputRef={fileInputRef}
            handleImageChange={handleImageChange}
            handleLogout={handleLogout}
            onClose={() => setProfileOpen(false)}
            profileImage={profileImage}
            removeProfilePhoto={removeProfilePhoto}
            user={user}
          />
        </>,
        document.body
      )}
    </>
  );
}
