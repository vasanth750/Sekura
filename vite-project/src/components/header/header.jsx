import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Inbox, KeyRound, Link2, Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import ProfileButton from "./profile";
import logo from "../../assets/SekuraLogo.png";
import { cn } from "../../lib/utils";
import { useTheme } from "../../theme/useTheme";

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: ShieldCheck },
  { name: "Secrets", path: "/secrets", icon: KeyRound },
  { name: "Create Link", path: "/create-link", icon: Link2 },
  { name: "Request", path: "/request", icon: Inbox },
];

const brandIconClass =
  "flex shrink-0 items-center justify-center rounded-lg border border-green-200 bg-gradient-to-br from-sky-50 to-green-50 shadow-sm shadow-slate-200/70 dark:border-green-400/20 dark:bg-green-400/10 dark:bg-none dark:shadow-none";

const navItemBase =
  "group inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 xl:px-4";

const activeNavItem =
  "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-200 dark:bg-green-400/10 dark:text-green-300 dark:ring-green-400/20";

const inactiveNavItem =
  "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white";

const iconButtonClass =
  "flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-green-200 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:bg-white/[0.08] dark:text-green-100";

function Brand({ compact = false }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className={cn(brandIconClass, compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-11 w-11")}>
        <img src={logo} alt="Sekura" className={cn("object-contain", compact ? "h-7 w-7 sm:h-8 sm:w-8" : "h-9 w-9")} />
      </span>
      <span className={cn("sekura-brand-text truncate font-black tracking-normal", compact ? "text-xl sm:text-2xl" : "text-3xl")}>Sekura</span>
    </span>
  );
}

function DesktopNav({ location }) {
  return (
    <nav className="hidden min-w-0 items-center gap-1 rounded-xl border border-slate-200/80 bg-white/90 p-1 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur lg:flex dark:border-white/10 dark:bg-slate-900/80 dark:shadow-sm">
      {navLinks.map(({ name, path, icon: Icon }) => {
        const isActive = location.pathname === path;

        return (
          <Link key={path} to={path} className={cn(navItemBase, isActive ? activeNavItem : inactiveNavItem)}>
            <Icon className={cn("h-4 w-4 transition duration-200", isActive ? "text-green-700 dark:text-green-300" : "text-slate-500 group-hover:text-green-700 dark:group-hover:text-green-300")} aria-hidden="true" />
            {name}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "group relative inline-flex h-11 shrink-0 cursor-pointer items-center rounded-full border border-slate-200 bg-slate-100 p-1 text-slate-700 shadow-sm transition-all duration-300 hover:border-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100",
        compact ? "w-11 justify-center sm:w-[5.6rem] sm:justify-start" : "w-[5.6rem]"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.span
        layoutId={compact ? "mobile-theme-thumb" : "desktop-theme-thumb"}
        className={cn(
          "absolute h-9 w-9 rounded-full bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-white/10",
          isDark ? "right-1" : "left-1"
        )}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      />
      <span className={cn("absolute z-10 flex h-9 w-9 items-center justify-center rounded-full", isDark ? "right-1 text-green-300" : "left-1 text-green-700")}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -35, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </motion.span>
      </span>
      <span className={cn("relative z-10 hidden flex-1 text-xs font-bold sm:block", isDark ? "pr-10 text-left text-slate-300" : "pl-10 text-right text-slate-600")}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

function MobileNavLink({ icon: Icon, isActive, name, onClick, path }) {
  return (
    <Link to={path} onClick={onClick} className={cn("group flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200", isActive ? "border-green-200 bg-green-50 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300" : "border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:border-green-300/35 dark:hover:bg-green-300/10")}>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200", isActive ? "bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-300" : "bg-slate-100 text-slate-500 group-hover:text-green-700 dark:bg-slate-900/80 dark:text-green-200/80")}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 truncate">{name}</span>
    </Link>
  );
}

function MobileDrawer({ location, onClose }) {
  return (
    <>
      <div onClick={onClose} className="sekura-modal-backdrop fixed inset-0 z-[100] animate-[sekuraBackdropFade_300ms_ease-out]" />
      <aside className="fixed inset-y-0 left-0 z-[110] flex h-dvh min-h-dvh w-[min(86vw,21rem)] max-w-full flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-950 shadow-[24px_0_70px_rgba(15,23,42,0.22)] animate-[sekuraMobileDrawerSlide_300ms_ease-out] dark:border-white/10 dark:bg-slate-950 dark:text-slate-100" aria-label="Mobile navigation">
        <div className="h-1 w-full bg-green-600" />
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-white/10">
          <Link to="/dashboard" onClick={onClose} className="min-w-0 cursor-pointer">
            <Brand compact />
          </Link>
          <button type="button" onClick={onClose} className={cn(iconButtonClass, "h-10 w-10 dark:text-slate-100")} aria-label="Close navigation">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-400/20 dark:bg-green-400/10">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-green-300">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Secure Workspace</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Manage secrets and protected links from one encrypted space.</p>
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
  const portalReady = typeof document !== "undefined";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 shadow-[0_10px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 dark:shadow-sm">
      <div className="flex min-h-16 w-full items-center px-2 py-3 sm:px-4 lg:min-h-[4.5rem] lg:px-5 xl:px-6">
        <div className="relative flex w-full items-center gap-3 lg:hidden">
          <button type="button" onClick={() => setMobileMenuOpen(true)} className={cn(iconButtonClass, "h-11 w-11 shadow-sm")} aria-label="Open navigation">
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <Link to="/dashboard" className="absolute left-1/2 max-w-[44vw] -translate-x-1/2 cursor-pointer overflow-hidden">
            <Brand compact />
          </Link>
          <div className="ml-auto flex min-w-0 items-center justify-end gap-2 overflow-visible">
            <ThemeToggle compact />
            <ProfileButton enablePortal={false} profileOpen={profileOpen} setProfileOpen={setProfileOpen} user={user} logout={logout} />
          </div>
        </div>

        <div className="hidden w-full items-center justify-between gap-6 lg:flex">
          <Link to="/dashboard" className="min-w-0 shrink-0 cursor-pointer">
            <Brand />
          </Link>
          <DesktopNav location={location} />
          <div className="flex shrink-0 items-center justify-end gap-3">
            <ThemeToggle />
            <ProfileButton profileOpen={profileOpen} setProfileOpen={setProfileOpen} user={user} logout={logout} />
          </div>
        </div>
      </div>

      {mobileMenuOpen && portalReady && createPortal(
        <MobileDrawer location={location} onClose={closeMobileMenu} />,
        document.body
      )}
    </header>
  );
}
