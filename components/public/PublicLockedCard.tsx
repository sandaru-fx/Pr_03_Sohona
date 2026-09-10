import { ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import {
  formatPinLockRemaining,
  formatPinLockUntil,
  PUBLIC_PIN_MAX_ATTEMPTS,
  PUBLIC_PIN_LOCK_MS,
} from "@/lib/public-pin-lock";

type PublicLockedCardProps = {
  displayName: string;
  lockedUntil: Date;
};

export function PublicLockedCard({
  displayName,
  lockedUntil,
}: PublicLockedCardProps) {
  const lockMinutes = Math.round(PUBLIC_PIN_LOCK_MS / 60000);

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <ShieldAlert className="h-6 w-6" aria-hidden />
      </div>

      <p className="mt-8 text-center text-xs font-medium uppercase tracking-[0.18em] text-gold">
        Mathaka QR
      </p>
      <h1 className="mt-4 text-center font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
        Please wait a moment
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-base leading-7 text-gray-400">
        Access to{" "}
        <span className="font-medium text-[#F5F1E8]">{displayName}</span>
        &apos;s memorial is paused after {PUBLIC_PIN_MAX_ATTEMPTS} incorrect PIN
        attempts.
      </p>

      <Alert tone="warning" className="mt-8">
        <p>Try again in {formatPinLockRemaining(lockedUntil)}.</p>
        <p className="mt-1 text-xs opacity-80">
          Available again around {formatPinLockUntil(lockedUntil)} (about{" "}
          {lockMinutes} minutes).
        </p>
      </Alert>

      <p className="mt-8 text-center text-sm leading-7 text-gray-500">
        Refresh this page after the wait to enter the PIN again.
      </p>
    </div>
  );
}
