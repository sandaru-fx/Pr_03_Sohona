import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition focus-visible:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
