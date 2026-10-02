import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
      className={cn("flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-0 w-full", className)}
      aria-label="Progress"
    >
      {steps.map((label, index) => {
        const active = index === current;
        const done = index < current;
        const isLast = index === steps.length - 1;
        
        return (
          <li
            key={label}
            className={cn(
              "flex items-center",
              !isLast && "sm:flex-1"
            )}
          >
            <div
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300",
                active 
                  ? "border-gold/40 bg-gold/10 text-gold shadow-[0_0_20px_-5px_rgba(212,175,55,0.2)]" 
                  : done 
                    ? "border-[#2A2E33] bg-background text-foreground" 
                    : "border-[#2A2E33]/50 bg-background/50 text-foreground-muted",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                  active
                    ? "bg-gold text-[#0B0D0F]"
                    : done
                      ? "bg-surface border border-[#2A2E33] text-gold"
                      : "bg-[#181C20] border border-[#2A2E33] text-gray-500",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            
            {!isLast && (
              <div
                className={cn(
                  "hidden sm:block h-[2px] flex-1 mx-4 rounded-full transition-colors duration-300",
                  done ? "bg-gold/30" : "bg-[#2A2E33]/50"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
