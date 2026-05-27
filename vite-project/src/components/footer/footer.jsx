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
      <div className="mx-auto flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-200 bg-green-50 shadow-sm dark:border-green-400/20 dark:bg-green-400/10">
            <img
              src={logo}
              alt="Sekura"
              className="h-9 w-9 object-contain"
            />
          </span>
          <div>
            <p className="sekura-brand-text text-xl font-black">
              Sekura
            </p>
            <p className="sekura-muted mt-1 text-sm">
              &copy; 2026 Sekura Inc. All rights reserved.
            </p>
          </div>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-semibold md:justify-end"
          aria-label="Footer links"
        >
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
