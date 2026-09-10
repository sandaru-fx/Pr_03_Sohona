import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-foreground shadow-none transition placeholder:text-foreground-muted focus-visible:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
