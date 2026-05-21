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
    <footer className="w-full border-t border-white/10 bg-slate-950/90 px-0 py-0 text-slate-300 backdrop-blur-2xl sm:px-6 sm:py-0 lg:px-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-2xl shadow-cyan-500/20">
            <img
              src={logo}
              alt="Sekura"
              className="h-9 w-9 object-contain"
            />
          </span>
          <div>
            <p className="bg-gradient-to-r from-cyan-200 via-blue-200 to-emerald-200 bg-clip-text text-xl font-black text-transparent">
              Sekura
            </p>
            <p className="mt-1 text-sm text-slate-400">
              &copy; 2026 Sekura Inc. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm font-semibold sm:flex-row sm:flex-wrap md:justify-end">
          {footerLinks.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-slate-300 no-underline transition-all hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
            >
              <Icon className="h-4 w-4 text-cyan-200" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
