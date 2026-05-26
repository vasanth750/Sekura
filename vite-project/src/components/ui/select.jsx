import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-950 outline-none transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/15 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:focus:border-green-300/70 dark:focus:ring-green-400/25",
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
