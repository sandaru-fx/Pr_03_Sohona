import { cn } from "@/lib/utils";

type ProgressStepsProps = {
  steps: string[];
  current: number;
  className?: string;
};

export function ProgressSteps({
  steps,
  current,
  className,
}: ProgressStepsProps) {
  return (
    <ol className={cn("flex flex-wrap gap-2", className)} aria-label="Progress">
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li
            key={label}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
              active && "border-gold/40 bg-gold-subtle text-gold",
              done && "border-border bg-surface-elevated text-foreground-secondary",
              !active &&
                !done &&
                "border-border text-foreground-muted",
            )}
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                active || done
                  ? "bg-gold text-background"
                  : "bg-surface text-foreground-muted",
              )}
            >
              {index + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
