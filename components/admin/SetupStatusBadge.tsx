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
        tone === "complete" && "bg-emerald-50 text-emerald-700",
        tone === "pending" && "bg-amber-50 text-amber-800",
        tone === "expired" && "bg-red-50 text-red-700",
      )}
    >
      {label}
    </span>
  );
}
