"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, AlertTriangle, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="w-full max-w-lg rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-10 sm:px-8 sm:py-12 shadow-[0_0_40px_-10px_rgba(212,175,55,0.05)] backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]"
        >
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </motion.div>
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-gold">Mathaka QR</p>
        <h1 className="mt-2 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
          PIN saved
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground-secondary">
          A PIN is now set for{" "}
          <span className="font-medium text-[#F5F1E8]">{displayName}</span>.
          This PIN is always required to edit the profile later.
          {isPublicPinRequired
            ? " Visitors who scan the QR will also need this PIN to view content."
            : " QR visitors can view content without a PIN."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-10 sm:px-8 sm:py-12 shadow-[0_0_40px_-10px_rgba(212,175,55,0.05)] backdrop-blur-md">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Mathaka QR</p>
      <h1 className="mt-2 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
        Create your security PIN
      </h1>
      <p className="mt-3 text-base leading-7 text-foreground-secondary">
        Setting up the memorial for{" "}
        <span className="font-medium text-[#F5F1E8]">{displayName}</span>. Choose
        a 6-digit PIN you can remember. You will need it to edit this profile
        later.
      </p>
      {expiresLabel ? (
        <p className="mt-3 text-xs text-foreground-muted">Link expires: {expiresLabel}</p>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor={pinId} className="block text-sm font-medium text-foreground">
            PIN <span className="text-error">*</span>
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
              "mt-2 h-11 w-full rounded-xl border bg-background-secondary px-4 font-mono text-lg tracking-[0.5em] text-center text-foreground outline-none transition-all",
              "focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:border-gold/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              fieldError ? "border-error/50" : "border-border",
            )}
          />
        </div>

        <div>
          <label
            htmlFor={confirmId}
            className="block text-sm font-medium text-foreground"
          >
            Confirm PIN <span className="text-error">*</span>
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
            placeholder="6 digits"
            className={cn(
              "mt-2 h-11 w-full rounded-xl border bg-background-secondary px-4 font-mono text-lg tracking-[0.5em] text-center text-foreground outline-none transition-all",
              "focus-visible:ring-2 focus-visible:ring-gold/20 focus-visible:border-gold/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              fieldError ? "border-error/50" : "border-border",
            )}
          />
        </div>

        <AnimatePresence>
          {fieldError ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p id={errorId} className="flex items-center gap-2 text-sm text-error mt-2" role="alert">
                <AlertTriangle className="h-4 w-4" />
                {fieldError}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <label
          htmlFor={toggleId}
          className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-background-secondary/50 px-5 py-4 transition-colors hover:border-gold/20 hover:bg-background-secondary"
        >
          <div className="pt-0.5 relative shrink-0">
            <input
              id={toggleId}
              type="checkbox"
              checked={isPublicPinRequired}
              disabled={submitting}
              onChange={(event) => setIsPublicPinRequired(event.target.checked)}
              className="sr-only"
            />
            <motion.div layout className="text-foreground transition-colors">
              {isPublicPinRequired ? (
                <ToggleRight className="h-7 w-7 text-gold" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-foreground-muted" />
              )}
            </motion.div>
          </div>
          <div>
            <span className="block text-sm font-medium text-foreground">
              Require PIN for public visitors
            </span>
            <span className="mt-1 block text-sm leading-6 text-foreground-secondary">
              Optional. If off, future visitors can view memories without a PIN.
              Editing always requires this PIN.
            </span>
          </div>
        </label>

        <AnimatePresence>
          {apiError ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error mt-4" role="alert">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {apiError}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-medium text-background transition-all",
            submitting
              ? "cursor-not-allowed bg-foreground-muted"
              : "bg-gold shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98]",
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
