import { cn } from "@/lib/utils";

type SetupStatusBadgeProps = {
  label: string;
  tone: "complete" | "pending" | "expired";
};

export function SetupStatusBadge({ label, tone }: SetupStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "complete" && "bg-success/10 text-success",
        tone === "pending" && "bg-warning/10 text-warning",
        tone === "expired" && "bg-error/10 text-error",
      )}
    >
      {label}
    </span>
  );
}
