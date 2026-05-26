import React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-none",
      className
    )}
    {...props}
  />
));

Card.displayName = "Card";
