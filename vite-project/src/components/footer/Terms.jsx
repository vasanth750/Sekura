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
    <div className="sekura-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="sekura-panel mx-auto max-w-5xl rounded-xl p-6 md:p-8">
        <p className="sekura-kicker rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          <ShieldCheck className="h-4 w-4" />
          Terms
        </p>

        <h1 className="sekura-heading mt-5 text-4xl font-black">
          Terms & Conditions
        </h1>

        <p className="sekura-muted mt-4 max-w-3xl">
          By accessing and using Sekura, you agree to comply with the following
          terms and conditions. Please read them carefully before using our services.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="sekura-surface rounded-xl p-5"
            >
              <h2 className="sekura-heading text-2xl font-bold">
                {section.title}
              </h2>

              <p className="sekura-muted mt-3">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
