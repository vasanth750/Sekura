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
    <div className="sekura-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="sekura-panel mx-auto max-w-4xl rounded-xl p-6 md:p-8">
        <p className="sekura-kicker rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          <ShieldCheck className="h-4 w-4" />
          Support
        </p>

        <h1 className="sekura-heading mt-5 text-4xl font-black">
          Contact Us
        </h1>

        <p className="sekura-muted mt-4">
          Have questions, security concerns, or feedback? Our team is here to help you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contactItems.map((item) => {
            const ItemIcon = item.icon;

            return (
              <div
                key={item.title}
                className="sekura-surface rounded-xl p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300">
                  <ItemIcon className="h-5 w-5" />
                </div>

                <h2 className="sekura-heading text-xl font-bold">
                  {item.title}
                </h2>

                <p className="sekura-muted mt-2">
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
