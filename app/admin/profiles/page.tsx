import Link from "next/link";
import { ChevronRight, PlusCircle, Users } from "lucide-react";
import {
  getSetupStatus,
  listAdminProfiles,
} from "@/lib/admin-profiles";
import { formatPackageAdminLabel } from "@/lib/packages";
import { SetupStatusBadge } from "@/components/admin/SetupStatusBadge";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminProfilesPage() {
  const profiles = await listAdminProfiles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
            Memorials
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
            Admin-safe overview only. Private family statements, media, and
            comments are never shown here.
          </p>
        </div>
        <Link
          href="/admin/create"
          className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C]"
        >
          <PlusCircle className="h-4 w-4" aria-hidden />
          Create Memorial
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-foreground-muted">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No memorials yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-foreground-secondary">
              Create the first memorial to generate a setup link and QR code.
            </p>
            <Link
              href="/admin/create"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground transition hover:bg-background-secondary"
            >
              Create Memorial
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border" role="list">
            {profiles.map((profile) => {
              const status = getSetupStatus(profile);
              const packageLabel = formatPackageAdminLabel(profile.packageTier);
              return (
                <li key={profile.id}>
                  <Link
                    href={`/admin/profiles/${profile.id}`}
                    className="flex items-center gap-4 px-4 py-4 transition hover:bg-background-secondary sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {profile.displayName}
                        </p>
                        <SetupStatusBadge
                          label={status.label}
                          tone={status.tone}
                        />
                        <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-foreground-secondary">
                          {packageLabel}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-foreground-muted">
                        qrId: {profile.qrId}
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Created {formatDate(profile.createdAt)}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-foreground-muted"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
