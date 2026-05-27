import { Link } from "react-router-dom";
import { FileText, Mail, ShieldCheck } from "lucide-react";
import logo from "../../assets/SekuraLogo.png";

const footerLinks = [
  {
    label: "Privacy Policy",
    path: "/privacy-policy",
    icon: ShieldCheck,
  },
  {
    label: "Terms & Conditions",
    path: "/terms-condition",
    icon: FileText,
  },
  {
    label: "Contact Us",
    path: "/contact-us",
    icon: Mail,
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/85 px-4 py-5 text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 dark:text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
          <div className="flex items-center justify-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-200 bg-green-50 shadow-sm dark:border-green-400/20 dark:bg-green-400/10">
              <img
                src={logo}
                alt="Sekura"
                className="h-9 w-9 object-contain"
              />
            </span>
            <p className="sekura-brand-text text-lg font-extrabold tracking-tight">
              Sekura
            </p>
          </div>
          <p className="sekura-muted mt-1 text-[12px] leading-relaxed opacity-80 lg:text-xs">
            &copy; 2026 Sekura Inc. All rights reserved.
          </p>
        </div>

        {/* Tablet/mobile footer links */}
        <nav
          className="grid grid-cols-1 gap-3 text-sm font-semibold xl:hidden sm:grid-cols-3"
          aria-label="Footer links"
        >
          {footerLinks.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="inline-flex items-center justify-center gap-2 text-slate-600 no-underline transition hover:text-green-700 dark:text-slate-300 dark:hover:text-green-100"
            >
              <Icon className="h-4 w-4 text-green-700 dark:text-green-300" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop footer links */}
        <nav className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-3 text-sm font-semibold xl:flex" aria-label="Footer links">
          {footerLinks.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="inline-flex items-center justify-center gap-2 text-slate-600 no-underline transition hover:text-green-700 dark:text-slate-300 dark:hover:text-green-100"
            >
              <Icon className="h-4 w-4 text-green-700 dark:text-green-300" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
