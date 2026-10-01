import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-[#2A2E33] bg-[#0B0D0F]/40 px-5 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-[#F5F1E8]">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-gray-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
