import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground shadow-none transition placeholder:text-foreground-muted focus-visible:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
