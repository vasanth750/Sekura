import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Inbox, KeyRound, Link2, Menu, ShieldCheck, X } from "lucide-react";
import ProfileButton from "./profile";
import logo from "../../assets/SekuraLogo.png";
import { cn } from "../../lib/utils";

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: ShieldCheck },
  { name: "Secrets", path: "/secrets", icon: KeyRound },
  { name: "Create Link", path: "/create-link", icon: Link2 },
  { name: "Request", path: "/request", icon: Inbox },
];

function Brand({ compact = false }) {
  return (
    <span className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className={cn("flex shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-lg shadow-cyan-500/20", compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-12 w-12")}>
        <img src={logo} alt="Sekura" className={cn("object-contain", compact ? "h-7 w-7 sm:h-8 sm:w-8" : "h-9 w-9")} />
      </span>
      <span className={cn("truncate bg-gradient-to-r from-cyan-200 via-blue-200 to-emerald-200 bg-clip-text font-black tracking-normal text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.2)]", compact ? "text-xl sm:text-2xl" : "text-3xl")}>Sekura</span>
    </span>
  );
}

function DesktopNav({ location }) {
  return (
    <nav className="hidden min-w-0 items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.07] p-1.5 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:flex">
      {navLinks.map(({ name, path, icon: Icon }) => {
        const isActive = location.pathname === path;

        return (
          <Link key={path} to={path} className={cn("group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 xl:px-4", isActive ? "border border-cyan-300/35 bg-cyan-300/12 text-cyan-50 shadow-lg shadow-cyan-500/10" : "text-slate-300 hover:bg-white/10 hover:text-white")}>
            <Icon className={cn("h-4 w-4 transition duration-300", isActive ? "text-cyan-200" : "text-slate-500 group-hover:text-cyan-200")} aria-hidden="true" />
            {name}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavLink({ icon: Icon, isActive, name, onClick, path }) {
  return (
    <Link to={path} onClick={onClick} className={cn("group flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-300", isActive ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-50 shadow-lg shadow-cyan-500/15" : "border-white/10 bg-white/[0.07] text-slate-100 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-white")}>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300", isActive ? "bg-cyan-300/15 text-cyan-100" : "bg-slate-900/80 text-cyan-200/80 group-hover:text-cyan-100")}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 truncate">{name}</span>
    </Link>
  );
}

function MobileDrawer({ location, onClose }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[80] bg-slate-950/75 backdrop-blur-md animate-[sekuraBackdropFade_300ms_ease-out]" />
      <aside className="fixed inset-y-0 left-0 z-[90] flex h-screen w-[min(88vw,20rem)] max-w-full flex-col overflow-hidden border-r border-cyan-300/25 bg-[#071028]/98 text-slate-100 shadow-[24px_0_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl animate-[sekuraMobileDrawerSlide_300ms_ease-out]" aria-label="Mobile navigation">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300" />
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
          <Link to="/dashboard" onClick={onClose} className="min-w-0">
            <Brand compact />
          </Link>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-slate-100 transition-all duration-300 hover:border-cyan-300/40 hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Close navigation">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] p-4 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Secure Workspace</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Manage secrets and protected links from one encrypted space.</p>
          </div>
          <nav className="mt-5 flex flex-col gap-2">
            {navLinks.map((link) => <MobileNavLink key={link.path} {...link} isActive={location.pathname === link.path} onClick={onClose} />)}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : { name: "", email: "" };
    } catch {
      return { name: "", email: "" };
    }
  });
  const location = useLocation();
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-slate-950/80 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center px-3 py-3 sm:px-5 lg:min-h-20 lg:px-8">
        <div className="grid w-full grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-2 lg:hidden">
          <button type="button" onClick={() => setMobileMenuOpen(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/15 text-cyan-50 shadow-lg shadow-cyan-500/15 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-200/70 hover:bg-cyan-300/25 hover:shadow-[0_0_22px_rgba(34,211,238,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Open navigation">
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link to="/dashboard" className="mx-auto min-w-0 max-w-full overflow-hidden">
            <Brand compact />
          </Link>
          <div className="flex min-w-0 justify-end overflow-visible">
            <ProfileButton profileOpen={profileOpen} setProfileOpen={setProfileOpen} user={user} logout={logout} />
          </div>
        </div>

        <div className="hidden w-full items-center justify-between gap-6 lg:flex">
          <Link to="/dashboard" className="min-w-0 shrink-0">
            <Brand />
          </Link>
          <DesktopNav location={location} />
          <div className="shrink-0">
            <ProfileButton profileOpen={profileOpen} setProfileOpen={setProfileOpen} user={user} logout={logout} />
          </div>
        </div>
      </div>

      {mobileMenuOpen && <MobileDrawer location={location} onClose={closeMobileMenu} />}
    </header>
  );
}
