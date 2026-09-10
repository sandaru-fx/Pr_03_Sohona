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
    <ol
      className={cn("flex flex-wrap items-center gap-2", className)}
      aria-label="Progress"
    >
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li
            key={label}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-300",
              active && "border-gold/40 bg-gold-subtle text-gold",
              done && "border-[#2A2E33] bg-[#181C20] text-gray-400",
              !active && !done && "border-[#2A2E33] text-gray-500",
            )}
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                active || done
                  ? "bg-gold text-[#0B0D0F]"
                  : "bg-[#0B0D0F] text-gray-500",
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
