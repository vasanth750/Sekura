import { useRef, useState } from "react";
import { Camera, ImageOff, LogOut, Mail, ShieldCheck, UserRound, X } from "lucide-react";
import defaultProfile from "../../assets/acc.jpeg";

function ProfileTriggerButton({ image, onOpen }) {
  return (
    <button type="button" onClick={onOpen} className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-300/40 bg-white/[0.06] p-0.5 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-200 hover:shadow-[0_0_28px_rgba(34,211,238,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Open profile">
      <span className="absolute inset-0 rounded-full bg-cyan-300/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <img src={image} alt="Profile" className="relative z-10 h-full w-full rounded-full object-cover" />
    </button>
  );
}

function ProfileInfoCard({ icon: Icon, label, value }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 transition-all duration-300 hover:border-cyan-300/30 hover:bg-cyan-300/[0.055] hover:shadow-[0_0_24px_rgba(34,211,238,0.12)]">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/10 text-cyan-200 transition-all duration-300 group-hover:border-cyan-300/30 group-hover:text-cyan-100">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-2 break-words text-sm font-bold leading-6 text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SecurityStatusCard() {
  return (
    <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.07] p-5 shadow-[0_0_28px_rgba(34,211,238,0.1)] transition-all duration-300 hover:border-cyan-300/45 hover:bg-cyan-300/[0.1]">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="font-bold text-white">Zero-Knowledge Security</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">Your secrets are encrypted locally before sharing.</p>
        </div>
      </div>
    </div>
  );
}

export default function ProfileButton({ profileOpen, setProfileOpen, user, logout }) {
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || defaultProfile);

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

      {profileOpen && (
        <>
          <div onMouseDown={() => setProfileOpen(false)} className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-md backdrop-saturate-150 animate-[sekuraBackdropFade_300ms_ease-out]" />

          <aside onMouseDown={(event) => event.stopPropagation()} className="fixed inset-y-0 right-0 z-[100] flex h-screen min-h-screen w-[min(100vw,420px)] flex-col overflow-hidden rounded-l-3xl border-l border-cyan-300/25 bg-[#071028]/95 text-slate-100 shadow-[-28px_0_70px_rgba(0,0,0,0.62)] backdrop-blur-2xl animate-[sekuraSidebarSlide_300ms_ease-out]" aria-label="Profile sidebar">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300" />

            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/55 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Profile</p>
                <h2 className="mt-1 text-2xl font-black tracking-normal text-white">Account Settings</h2>
              </div>

              <button type="button" onClick={() => setProfileOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 transition-all duration-300 hover:scale-105 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Close profile">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_38%),linear-gradient(180deg,rgba(2,6,23,0.4)_0%,rgba(15,23,42,0.72)_100%)] px-6 py-7">
              <div className="rounded-3xl border border-cyan-300/25 bg-white/[0.045] p-6 text-center shadow-[0_0_35px_rgba(34,211,238,0.12)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/40 hover:shadow-[0_0_42px_rgba(34,211,238,0.18)]">
                <div className="relative mx-auto h-32 w-32">
                  <img src={profileImage} alt="Profile" className="h-full w-full rounded-full border-4 border-cyan-200/80 object-cover shadow-[0_0_35px_rgba(34,211,238,0.34)] transition-transform duration-300 hover:scale-[1.03]" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-100/80 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-110 hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100" aria-label="Upload profile photo">
                    <Camera className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

                <p className="mt-5 text-sm font-semibold text-slate-400">Add your profile photo</p>

                <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-cyan-200 hover:via-blue-300 hover:to-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
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

            <div className="border-t border-white/10 bg-slate-950/65 p-6">
              <button type="button" onClick={handleLogout} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-4 font-bold text-white shadow-xl shadow-red-500/25 transition-all duration-300 hover:scale-[1.01] hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
