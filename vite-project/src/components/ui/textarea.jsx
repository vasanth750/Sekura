import React from "react";
import { cn } from "../../lib/utils";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-inner shadow-slate-900/5 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-green-300/70 dark:focus:ring-green-400/25",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
