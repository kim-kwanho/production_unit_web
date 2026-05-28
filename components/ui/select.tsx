"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950",
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = "Select";

