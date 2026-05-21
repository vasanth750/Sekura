import { useState } from "react";
import { Eye, EyeOff, Link2, Search, X } from "lucide-react";

export default function CreateLink({ closePopup }) {
  const [secretName, setSecretName] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [expireTime, setExpireTime] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-[1100px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40 md:p-8 lg:p-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
              <Link2 className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Create Secure Link
            </h2>
          </div>

          <button
            onClick={closePopup}
            className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close create link"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search secret by name, tags, or environment..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-5 py-4 pl-14 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25 md:text-base"
          />

          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-200">
              Secret Name
            </label>

            <input
              type="text"
              placeholder="Enter Secret Name"
              value={secretName}
              onChange={(e) => {
                setSecretName(e.target.value);
              }}
              className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-200">
              Expiry Time
            </label>

            <select
              value={expireTime}
              onChange={(e) => {
                setExpireTime(e.target.value);
              }}
              className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
            >
              <option value="" className="bg-slate-950">Select Expiry Time</option>
              <option value="5 Minutes" className="bg-slate-950">5 Minutes</option>
              <option value="30 Minutes" className="bg-slate-950">30 Minutes</option>
              <option value="1 Hour" className="bg-slate-950">1 Hour</option>
              <option value="24 Hours" className="bg-slate-950">24 Hours</option>
              <option value="7 Days" className="bg-slate-950">7 Days</option>
            </select>
          </div>
        </div>

        <div className="mt-8">
          <label className="text-sm font-semibold text-slate-200">
            Secret Value
          </label>

          <div className="relative mt-2">
            <input
              type={showSecret ? "text" : "password"}
              placeholder="Enter Secret Value"
              value={secretValue}
              onChange={(e) => {
                setSecretValue(e.target.value);
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 pr-14 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25"
            />

            <button
              type="button"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-cyan-100"
              onClick={() => setShowSecret((current) => !current)}
              aria-label={showSecret ? "Hide secret" : "Show secret"}
            >
              {showSecret ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-end gap-4 sm:flex-row">
          <button
            onClick={closePopup}
            className="rounded-xl border border-white/10 bg-white/[0.08] px-6 py-4 font-semibold text-white transition hover:bg-white/[0.12]"
          >
            Cancel
          </button>

          <button className="rounded-xl bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 px-8 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01]">
            Generate Secure Link
          </button>
        </div>
      </div>
    </div>
  );
}
