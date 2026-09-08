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
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
        <KeyRound className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-zinc-500">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Enter PIN to manage
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Private owner access for{" "}
        <span className="font-medium text-zinc-900">{displayName}</span>. The
        manage link alone is never enough — enter your 6-digit memorial PIN.
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor={pinId} className="block text-sm font-medium text-zinc-900">
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
              "mt-2 h-11 w-full rounded-xl border bg-white px-3.5 font-mono text-sm tracking-widest text-zinc-900 shadow-sm outline-none transition",
              "focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:bg-zinc-50",
              fieldError ? "border-red-300" : "border-zinc-200",
            )}
          />
        </div>

        {fieldError ? (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {fieldError}
          </p>
        ) : null}

        {apiError ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {apiError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
            submitting
              ? "cursor-not-allowed bg-zinc-400"
              : "bg-zinc-900 hover:bg-zinc-800",
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
