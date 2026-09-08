import { ShieldAlert } from "lucide-react";
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
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <ShieldAlert className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-zinc-500">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Temporarily locked
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        The memorial for{" "}
        <span className="font-medium text-zinc-900">{displayName}</span> is
        locked after {PUBLIC_PIN_MAX_ATTEMPTS} incorrect PIN attempts.
      </p>
      <div className="mt-6 space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p>Try again in {formatPinLockRemaining(lockedUntil)}.</p>
        <p className="text-xs text-amber-900/80">
          Unlock window: {formatPinLockUntil(lockedUntil)} (about {lockMinutes}{" "}
          minute lock).
        </p>
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Refresh this page after the wait to enter the PIN again.
      </p>
    </div>
  );
}
