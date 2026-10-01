"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
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
    <div className="w-full max-w-md rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-subtle text-gold">
        <LockKeyhole className="h-6 w-6" aria-hidden />
      </div>

      <p className="mt-8 text-center text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Mathaka QR
      </p>
      <h1 className="mt-4 text-center font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
        Private Memories
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-base leading-7 text-gray-400">
        This part of the memorial for{" "}
        <span className="font-medium text-[#F5F1E8]">{displayName}</span> is
        protected for family and invited viewers.
      </p>

      <form className="mt-10 space-y-6" onSubmit={onSubmit} noValidate>
        <div>
          <label
            htmlFor={pinId}
            className="mb-4 block text-center text-sm font-medium text-[#F5F1E8]"
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
            autoFocus
          />
        </div>

        {fieldError ? (
          <p
            id={errorId}
            className="text-center text-sm text-error"
            role="alert"
          >
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
    </div>
  );
}
