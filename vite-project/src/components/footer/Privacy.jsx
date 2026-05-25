import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Information We Collect",
    body: "Sekura may collect personal information such as your name, email address, encrypted credentials, uploaded files, and usage activity to provide secure services and improve user experience.",
  },
  {
    title: "Data Protection",
    body: "All sensitive information stored within Sekura is protected using modern encryption standards and secure authentication mechanisms. We implement security best practices to prevent unauthorized access, disclosure, or modification of data.",
  },
  {
    title: "User Responsibility",
    body: "Users are responsible for maintaining the confidentiality of their account credentials and ensuring secure access to their devices. Sekura is not responsible for unauthorized access caused by user negligence.",
  },
  {
    title: "Third-Party Services",
    body: "Sekura may integrate with trusted third-party services for authentication, analytics, or cloud storage. These services are governed by their respective privacy policies.",
  },
  {
    title: "Policy Updates",
    body: "We reserve the right to update this Privacy Policy at any time to reflect security improvements, regulatory changes, or service enhancements.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="sekura-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="sekura-panel mx-auto max-w-5xl rounded-xl p-6 md:p-8">
        <p className="sekura-kicker rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          <ShieldCheck className="h-4 w-4" />
          Privacy
        </p>

        <h1 className="sekura-heading mt-5 text-4xl font-black">
          Privacy Policy
        </h1>

        <p className="sekura-muted mt-4 max-w-3xl">
          At Sekura, we value your privacy and are committed to protecting your
          sensitive information. This Privacy Policy explains how we collect,
          use, store, and safeguard your data while using our platform.
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
