import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By creating an account or accessing Sekura, users agree to abide by all security policies, platform guidelines, and applicable laws and regulations.",
  },
  {
    title: "Account Responsibility",
    body: "Users are responsible for maintaining the confidentiality of their account credentials and activities performed under their accounts.",
  },
  {
    title: "Prohibited Activities",
    body: "Users must not misuse the platform for unauthorized access, malicious attacks, illegal data storage, or activities that violate cybersecurity regulations.",
  },
  {
    title: "Service Availability",
    body: "Sekura strives to maintain uninterrupted service but does not guarantee continuous availability due to maintenance, technical issues, or external disruptions.",
  },
  {
    title: "Modifications",
    body: "Sekura reserves the right to modify these terms at any time. Continued use of the platform after updates constitutes acceptance of the revised terms.",
  },
];

export default function TermsConditions() {
  return (
    <div className="relative isolate min-h-full overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.14),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#020617_100%)]" />
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          <ShieldCheck className="h-4 w-4" />
          Terms
        </p>

        <h1 className="mt-5 text-4xl font-black text-white">
          Terms & Conditions
        </h1>

        <p className="mt-4 max-w-3xl text-slate-400">
          By accessing and using Sekura, you agree to comply with the following
          terms and conditions. Please read them carefully before using our services.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-slate-950/45 p-5"
            >
              <h2 className="text-2xl font-bold text-white">
                {section.title}
              </h2>

              <p className="mt-3 text-slate-400">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
