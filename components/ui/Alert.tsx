import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "success" | "warning" | "error";

const toneClass: Record<AlertTone, string> = {
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  error: "border-error/30 bg-error/10 text-error",
};

export function Alert({
  className,
  tone = "info",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-6",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
