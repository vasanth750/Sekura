import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

const contactItems = [
  {
    title: "Email Support",
    value: "support@sekura.com",
    icon: Mail,
  },
  {
    title: "Phone",
    value: "+91 98765 43210",
    icon: Phone,
  },
  {
    title: "Office Address",
    value: "Sekura Technologies Pvt Ltd, Coimbatore, Tamil Nadu, India",
    icon: MapPin,
  },
  {
    title: "Working Hours",
    value: "Monday - Friday | 9:00 AM - 6:00 PM",
    icon: Clock,
  },
];

export default function ContactUs() {
  return (
    <div className="relative isolate min-h-full overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.14),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#020617_100%)]" />
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          <ShieldCheck className="h-4 w-4" />
          Support
        </p>

        <h1 className="mt-5 text-4xl font-black text-white">
          Contact Us
        </h1>

        <p className="mt-4 text-slate-400">
          Have questions, security concerns, or feedback? Our team is here to help you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contactItems.map((item) => {
            const ItemIcon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-slate-950/45 p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                  <ItemIcon className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-bold text-white">
                  {item.title}
                </h2>

                <p className="mt-2 text-slate-400">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
