import React from "react";
import { cn } from "../../lib/utils";

const variants = {
  default:
    "bg-green-600 text-white shadow-lg shadow-green-500/20 hover:bg-green-700 dark:bg-green-500 dark:text-slate-950 dark:hover:bg-green-400",
  secondary:
    "border border-slate-200 bg-white text-slate-900 hover:bg-green-50 dark:border-white/10 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.12]",
  ghost:
    "text-slate-700 hover:bg-green-50 dark:text-slate-200 dark:hover:bg-white/10",
  destructive:
    "bg-red-500 text-white hover:bg-red-400",
};

export const Button = React.forwardRef(
  ({ className, variant = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60 dark:focus-visible:ring-green-300 dark:focus-visible:ring-offset-slate-950",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
