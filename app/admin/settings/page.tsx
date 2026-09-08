import Link from "next/link";

/**
 * Settings placeholder — Phase 3.2 nav target only.
 */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Admin settings will be available in a later phase.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-zinc-600">
          Nothing to configure here yet.{" "}
          <Link
            href="/admin/create"
            className="font-medium text-zinc-900 underline underline-offset-4"
          >
            Create a profile
          </Link>{" "}
          to continue.
        </p>
      </div>
    </div>
  );
}
