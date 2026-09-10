import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 min-h-11 w-full rounded-xl border border-[#2A2E33] bg-[#181C20] px-3.5 font-sans text-sm text-[#F5F1E8] shadow-none transition-opacity duration-300",
        "placeholder:text-gray-500",
        "focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
