import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { listAdminProfiles } from "@/lib/admin-profiles";

export default async function AdminDashboardPage() {
  const profiles = await listAdminProfiles();
  const pending = profiles.filter((profile) => !profile.isSetupComplete).length;
  const complete = profiles.filter((profile) => profile.isSetupComplete).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Create memorial profiles and issue secure family setup links. Private
          family media stays invisible to temple admins.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total profiles
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {profiles.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Awaiting setup
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {pending}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Setup complete
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {complete}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-medium text-zinc-900">Quick actions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            Create Profile
          </Link>
          <Link
            href="/admin/profiles"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
          >
            <Users className="h-4 w-4" aria-hidden />
            View Profiles
          </Link>
        </div>
      </div>
    </div>
  );
}
