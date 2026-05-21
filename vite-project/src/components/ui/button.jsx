import React from "react";
import { cn } from "../../lib/utils";

const variants = {
  default:
    "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400",
  secondary:
    "border border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.12]",
  ghost:
    "text-slate-200 hover:bg-white/10",
  destructive:
    "bg-red-500 text-white hover:bg-red-400",
};

export const Button = React.forwardRef(
  ({ className, variant = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
