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
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to profiles
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {profile.displayName}
          </h1>
          <SetupStatusBadge label={status.label} tone={status.tone} />
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
            {formatPackageAdminLabel(profile.packageTier)}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          Admin view only — private family content is never loaded here.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Package
          </p>
          <p className="mt-1 text-sm text-zinc-900">{pkg.label}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {pkg.limits.maxImages} photos · {pkg.limits.maxVideoSeconds}s video ·{" "}
            {pkg.limits.maxAudioSeconds}s audio · {pkg.limits.maxStatementWords}{" "}
            words
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Retention window
          </p>
          <p className="mt-1 text-sm text-zinc-900">
            {profile.packageStartedAt
              ? `${formatDateTime(profile.packageStartedAt)} → ${formatDateTime(profile.packageEndsAt)}`
              : "Starts when family finishes setup"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            QR ID
          </p>
          <p className="mt-1 break-all font-mono text-sm text-zinc-900">
            {profile.qrId}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Created
          </p>
          <p className="mt-1 text-sm text-zinc-900">
            {formatDateTime(profile.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Setup link expires
          </p>
          <p className="mt-1 text-sm text-zinc-900">
            {formatDateTime(profile.setupTokenExpiresAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Setup used at
          </p>
          <p className="mt-1 text-sm text-zinc-900">
            {formatDateTime(profile.setupUsedAt)}
          </p>
        </div>
      </div>

      {profile.isSetupComplete ? (
        <div
          className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-700"
          role="status"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
          <p className="text-sm leading-6">
            Family setup is complete. The original one-time setup link is no
            longer valid and cannot be shown again from the admin panel.
          </p>
        </div>
      ) : status.tone === "expired" ? (
        <div
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950"
          role="status"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm leading-6">
            The setup link has expired. Regenerating setup links will be added
            in a later phase.
          </p>
        </div>
      ) : (
        <div
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950"
          role="status"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
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
