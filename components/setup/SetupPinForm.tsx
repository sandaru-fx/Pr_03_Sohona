"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SetupPinFormProps = {
  profileId: string;
  displayName: string;
  setupToken: string;
  expiresLabel?: string | null;
  onSaved?: () => void;
};

export function SetupPinForm({
  profileId,
  displayName,
  setupToken,
  expiresLabel,
  onSaved,
}: SetupPinFormProps) {
  const pinId = useId();
  const confirmId = useId();
  const toggleId = useId();
  const errorId = useId();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isPublicPinRequired, setIsPublicPinRequired] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);

    if (!/^\d{6}$/.test(pin)) {
      setFieldError("PIN must be exactly 6 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setFieldError("PIN and confirmation do not match.");
      return;
    }

    setFieldError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/setup/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          setupToken,
          pin,
          confirmPin,
          isPublicPinRequired,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        issues?: Array<{ message: string }>;
      };

      if (!response.ok) {
        setApiError(
          data.issues?.[0]?.message ??
            data.message ??
            data.error ??
            "Could not save PIN. Please try again.",
        );
        return;
      }

      setPin("");
      setConfirmPin("");
      if (onSaved) {
        onSaved();
        return;
      }
      setSaved(true);
    } catch {
      setApiError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-5 text-sm tracking-wide text-foreground-muted">Sohona</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          PIN saved
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground-secondary">
          A PIN is now set for{" "}
          <span className="font-medium text-foreground">{displayName}</span>.
          This PIN is always required to edit the profile later.
          {isPublicPinRequired
            ? " Visitors who scan the QR will also need this PIN to view content."
            : " QR visitors can view content without a PIN."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <p className="text-sm tracking-wide text-foreground-muted">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        Create your security PIN
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground-secondary">
        Setting up the memorial for{" "}
        <span className="font-medium text-foreground">{displayName}</span>. Choose
        a 6-digit PIN you can remember. You will need it to edit this profile
        later.
      </p>
      {expiresLabel ? (
        <p className="mt-3 text-xs text-foreground-muted">Link expires: {expiresLabel}</p>
      ) : null}

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
            autoComplete="new-password"
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

        <div>
          <label
            htmlFor={confirmId}
            className="block text-sm font-medium text-foreground"
          >
            Confirm PIN
          </label>
          <input
            id={confirmId}
            name="confirmPin"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={6}
            disabled={submitting}
            value={confirmPin}
            onChange={(event) => {
              setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 6));
              if (fieldError) setFieldError(null);
            }}
            placeholder="Repeat 6 digits"
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

        <label
          htmlFor={toggleId}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background-secondary px-4 py-3"
        >
          <input
            id={toggleId}
            type="checkbox"
            checked={isPublicPinRequired}
            disabled={submitting}
            onChange={(event) => setIsPublicPinRequired(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-foreground focus-visible:ring-gold"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">
              Require PIN to view profile via QR code
            </span>
            <span className="mt-1 block text-sm leading-6 text-foreground-secondary">
              Optional. If off, future visitors can view memories without a PIN.
              Editing always requires this PIN.
            </span>
          </span>
        </label>

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
              Saving PIN…
            </>
          ) : (
            "Save PIN & continue"
          )}
        </button>
      </form>
    </div>
  );
}
