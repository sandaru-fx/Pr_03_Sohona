import { ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
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
    <Card className="w-full max-w-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <ShieldAlert className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-5 text-sm tracking-wide text-foreground-muted">Sohona</p>
      <h1 className="mt-2 font-display text-3xl text-foreground">
        Please wait a moment
      </h1>
      <p className="mt-3 text-sm leading-6 text-foreground-secondary">
        Access to{" "}
        <span className="font-medium text-foreground">{displayName}</span>
        &apos;s memorial is paused after {PUBLIC_PIN_MAX_ATTEMPTS} incorrect PIN
        attempts.
      </p>
      <Alert tone="warning" className="mt-6">
        <p>Try again in {formatPinLockRemaining(lockedUntil)}.</p>
        <p className="mt-1 text-xs opacity-80">
          Available again around {formatPinLockUntil(lockedUntil)} (about{" "}
          {lockMinutes} minutes).
        </p>
      </Alert>
      <p className="mt-6 text-sm text-foreground-muted">
        Refresh this page after the wait to enter the PIN again.
      </p>
    </Card>
  );
}
