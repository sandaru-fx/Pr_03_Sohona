import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full rounded-xl border border-white/5 bg-[#0B0D0F]/60 px-3.5 py-3 font-sans text-sm text-[#F5F1E8] shadow-none transition-all duration-300",
          "placeholder:text-gray-500",
          "focus:border-gold/40 focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/50",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);
