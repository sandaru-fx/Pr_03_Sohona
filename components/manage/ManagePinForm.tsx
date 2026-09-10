"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ManagePinFormProps = {
  manageToken: string;
  displayName: string;
};

export function ManagePinForm({
  manageToken,
  displayName,
}: ManagePinFormProps) {
  const router = useRouter();
  const pinId = useId();
  const errorId = useId();

  const [pin, setPin] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);

    if (!/^\d{6}$/.test(pin)) {
      setFieldError("PIN must be exactly 6 digits.");
      return;
    }

    setFieldError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/manage/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manageToken, pin }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        issues?: Array<{ message: string }>;
        attemptsRemaining?: number;
      };

      if (!response.ok) {
        if (response.status === 423) {
          router.refresh();
          return;
        }

        const extra =
          typeof data.attemptsRemaining === "number"
            ? ` (${data.attemptsRemaining} attempts left)`
            : "";
        setApiError(
          (data.issues?.[0]?.message ??
            data.message ??
            data.error ??
            "Incorrect PIN.") + extra,
        );
        return;
      }

      setPin("");
      router.refresh();
    } catch {
      setApiError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-foreground-secondary">
        <KeyRound className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-foreground-muted">Mathaka QR</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        Enter PIN to manage
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground-secondary">
        Private owner access for{" "}
        <span className="font-medium text-foreground">{displayName}</span>. The
        manage link alone is never enough — enter your 6-digit memorial PIN.
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor={pinId} className="block text-sm font-medium text-foreground">
            PIN
          </label>
          <input
            id={pinId}
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={submitting}
            value={pin}
            onChange={(event) => {
              setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
              if (fieldError) setFieldError(null);
            }}
            placeholder="6 digits"
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? errorId : undefined}
            className={cn(
              "mt-2 h-11 w-full rounded-xl border bg-surface px-3.5 font-mono text-sm tracking-widest text-foreground shadow-sm outline-none transition",
              "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:bg-background-secondary",
              fieldError ? "border-error" : "border-border",
            )}
          />
        </div>

        {fieldError ? (
          <p id={errorId} className="text-sm text-error" role="alert">
            {fieldError}
          </p>
        ) : null}

        {apiError ? (
          <p
            className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {apiError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-background transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
            submitting
              ? "cursor-not-allowed bg-foreground-muted"
              : "bg-gold hover:bg-gold-hover",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Checking…
            </>
          ) : (
            "Unlock manage access"
          )}
        </button>
      </form>
    </div>
  );
}
