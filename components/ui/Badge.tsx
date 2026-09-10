import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "gold" | "success" | "warning" | "error" | "info";

const toneClass: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface-elevated text-foreground-secondary",
  gold: "border-gold/30 bg-gold-subtle text-gold",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  error: "border-error/30 bg-error/10 text-error",
  info: "border-info/30 bg-info/10 text-info",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 font-sans text-xs font-medium shadow-none",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
