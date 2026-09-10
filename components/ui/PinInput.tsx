"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type PinInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
};

export function PinInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  id,
  ariaLabel = "PIN",
  autoFocus = false,
}: PinInputProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, length));
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
      setDigit(index - 1, "");
    }
  }

  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, index) => (
        <input
          key={`${baseId}-${index}`}
          ref={(node) => {
            refs.current[index] = node;
          }}
          id={index === 0 ? baseId : undefined}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          value={digit}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, next);
            if (next && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            const focusIndex = Math.min(pasted.length, length - 1);
            refs.current[focusIndex]?.focus();
          }}
          className={cn(
            "h-12 w-11 rounded-xl border border-border bg-surface text-center text-lg tracking-widest text-foreground transition focus-visible:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-60 sm:h-14 sm:w-12",
          )}
        />
      ))}
    </div>
  );
}
