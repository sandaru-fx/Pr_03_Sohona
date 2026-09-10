import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-[#0B0D0F] hover:bg-gold-hover disabled:bg-foreground-muted disabled:text-[#0B0D0F]/70",
  secondary:
    "border border-border bg-surface text-foreground hover:border-gold/40 hover:bg-surface-elevated",
  ghost:
    "text-foreground-secondary hover:bg-gold-subtle hover:text-foreground",
  danger:
    "border border-error/40 bg-error/10 text-error hover:bg-error/20",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 min-h-11 px-5 text-sm",
  lg: "h-12 min-h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-sans font-medium shadow-none transition-opacity duration-300",
          "focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...props}
      />
    );
  },
);
