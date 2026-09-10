import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import {
  getAdminProfileById,
  getPublicProfileUrl,
  getSetupStatus,
} from "@/lib/admin-profiles";
import { ProfileQrCard } from "@/components/admin/ProfileQrCard";
import { SetupStatusBadge } from "@/components/admin/SetupStatusBadge";
import {
  formatPackageAdminLabel,
  getPackageDefinition,
} from "@/lib/packages";

type ProfileDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDateTime(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { id } = await params;
  const profile = await getAdminProfileById(id);

  if (!profile) {
    notFound();
  }

  const status = getSetupStatus(profile);
  const publicUrl = getPublicProfileUrl(profile.qrId);
  const pkg = getPackageDefinition(profile.packageTier);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/profiles"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground-secondary transition hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to memorials
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            {profile.displayName}
          </h1>
          <SetupStatusBadge label={status.label} tone={status.tone} />
          <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-xs font-medium text-foreground-secondary">
            {formatPackageAdminLabel(profile.packageTier)}
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground-secondary">
          Admin view only — private family content is never loaded here.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Package
          </p>
          <p className="mt-1 text-sm text-foreground">{pkg.label}</p>
          <p className="mt-1 text-xs text-foreground-muted">
            {pkg.limits.maxImages} photos · {pkg.limits.maxVideoSeconds}s video ·{" "}
            {pkg.limits.maxAudioSeconds}s audio · {pkg.limits.maxStatementWords}{" "}
            words
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Retention window
          </p>
          <p className="mt-1 text-sm text-foreground">
            {profile.packageStartedAt
              ? `${formatDateTime(profile.packageStartedAt)} → ${formatDateTime(profile.packageEndsAt)}`
              : "Starts when family finishes setup"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            QR ID
          </p>
          <p className="mt-1 break-all font-mono text-sm text-foreground">
            {profile.qrId}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Created
          </p>
          <p className="mt-1 text-sm text-foreground">
            {formatDateTime(profile.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Setup link expires
          </p>
          <p className="mt-1 text-sm text-foreground">
            {formatDateTime(profile.setupTokenExpiresAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Setup used at
          </p>
          <p className="mt-1 text-sm text-foreground">
            {formatDateTime(profile.setupUsedAt)}
          </p>
        </div>
      </div>

      {profile.isSetupComplete ? (
        <div
          className="flex gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground-secondary"
          role="status"
        >
          <Info
            className="mt-0.5 h-5 w-5 shrink-0 text-foreground-muted"
            aria-hidden
          />
          <p className="text-sm leading-6">
            Family setup is complete. The original one-time setup link is no
            longer valid and cannot be shown again from the admin panel.
          </p>
        </div>
      ) : status.tone === "expired" ? (
        <div
          className="flex gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-foreground"
          role="status"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
          <p className="text-sm leading-6">
            The setup link has expired. Regenerating setup links will be added
            in a later phase.
          </p>
        </div>
      ) : (
        <div
          className="flex gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-foreground"
          role="status"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
          <p className="text-sm leading-6">
            Waiting for the family to open the one-time setup link. That link
            was shown only at creation time and is not stored in plaintext here.
          </p>
        </div>
      )}

      <ProfileQrCard
        publicUrl={publicUrl}
        fileName={`sohona-qr-${profile.qrId}.png`}
      />
    </div>
  );
}
