"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PinInput } from "@/components/ui/PinInput";

type PublicPinFormProps = {
  qrId: string;
  displayName: string;
};

export function PublicPinForm({ qrId, displayName }: PublicPinFormProps) {
  const router = useRouter();
  const pinId = useId();
  const errorId = useId();

  const [pin, setPin] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);

    if (!/^\d{6}$/.test(pin)) {
      setFieldError("Enter all 6 digits to continue.");
      return;
    }

    setFieldError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/public/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId, pin }),
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
            "That PIN did not match.") + extra,
        );
        return;
      }

      setPin("");
      router.refresh();
    } catch {
      setApiError("Something went wrong. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-subtle text-gold">
        <LockKeyhole className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-foreground-muted">Mathaka QR</p>
      <h1 className="mt-2 font-display text-3xl text-foreground">
        Private Memories
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground-secondary">
        This part of the memorial for{" "}
        <span className="font-medium text-foreground">{displayName}</span> is
        protected for family and invited viewers.
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label
            htmlFor={pinId}
            className="mb-3 block text-sm font-medium text-foreground"
          >
            Enter 6-digit PIN
          </label>
          <PinInput
            id={pinId}
            value={pin}
            onChange={(value) => {
              setPin(value);
              if (fieldError) setFieldError(null);
            }}
            disabled={submitting}
            ariaLabel="Memorial PIN"
          />
        </div>

        {fieldError ? (
          <p id={errorId} className="text-sm text-error" role="alert">
            {fieldError}
          </p>
        ) : null}

        {apiError ? (
          <Alert tone="error" role="alert">
            {apiError}
          </Alert>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Checking…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </Card>
  );
}
