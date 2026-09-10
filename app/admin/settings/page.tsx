import Link from "next/link";

/**
 * Settings placeholder — visually on-system; configuration later.
 */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Admin settings will be available in a later phase.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm text-foreground-secondary">
          Nothing to configure here yet.{" "}
          <Link
            href="/admin/create"
            className="font-medium text-gold underline-offset-4 hover:underline"
          >
            Create a memorial
          </Link>{" "}
          to continue.
        </p>
      </div>
    </div>
  );
}
