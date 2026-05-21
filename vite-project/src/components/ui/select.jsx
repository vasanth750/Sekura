import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-12 w-full appearance-none rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 pr-11 text-sm text-white outline-none transition-all duration-200 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-400/25",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    />
  </div>
));

Select.displayName = "Select";
