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
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Profiles
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Admin-safe overview only. Private family statements, media, and
            comments are never shown here.
          </p>
        </div>
        <Link
          href="/admin/create"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          <PlusCircle className="h-4 w-4" aria-hidden />
          Create Profile
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-900">
              No profiles yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-600">
              Create the first memorial profile to generate a setup link and QR
              code.
            </p>
            <Link
              href="/admin/create"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              Create Profile
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200" role="list">
            {profiles.map((profile) => {
              const status = getSetupStatus(profile);
              const packageLabel = formatPackageAdminLabel(profile.packageTier);
              return (
                <li key={profile.id}>
                  <Link
                    href={`/admin/profiles/${profile.id}`}
                    className="flex items-center gap-4 px-4 py-4 transition hover:bg-zinc-50 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {profile.displayName}
                        </p>
                        <SetupStatusBadge
                          label={status.label}
                          tone={status.tone}
                        />
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                          {packageLabel}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-zinc-500">
                        qrId: {profile.qrId}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Created {formatDate(profile.createdAt)}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-zinc-400"
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
