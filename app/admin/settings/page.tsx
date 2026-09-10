import Link from "next/link";

/**
 * Settings placeholder — visually on-system; configuration later.
 */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
          Admin settings will be available in a later phase.
        </p>
      </div>

      <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8">
        <p className="text-base leading-7 text-gray-400">
          Nothing to configure here yet.{" "}
          <Link
            href="/admin/create"
            className="font-medium text-gold transition-opacity duration-300 hover:opacity-80"
          >
            Create a memorial
          </Link>{" "}
          to continue.
        </p>
      </div>
    </div>
  );
}
