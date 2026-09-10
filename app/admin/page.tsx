import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { listAdminProfiles } from "@/lib/admin-profiles";

export default async function AdminDashboardPage() {
  const profiles = await listAdminProfiles();
  const pending = profiles.filter((profile) => !profile.isSetupComplete).length;
  const complete = profiles.filter((profile) => profile.isSetupComplete).length;
  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  const expiringSoon = profiles.filter((profile) => {
    if (!profile.packageEndsAt) return false;
    const end = profile.packageEndsAt.getTime();
    return end >= now && end - now <= ninetyDays;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
          Create memorial profiles and issue secure family setup links. Private
          family media stays invisible to temple admins.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-[#2A2E33] bg-[#2A2E33] sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total memorials", value: profiles.length },
          { label: "Active memorials", value: complete },
          { label: "Pending family setup", value: pending },
          { label: "Expiring soon", value: expiringSoon },
        ].map((item) => (
          <div key={item.label} className="bg-[#181C20] px-5 py-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
              {item.label}
            </p>
            <p className="mt-3 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-8 sm:px-8">
        <h2 className="text-sm font-medium text-[#F5F1E8]">Quick actions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/create"
            className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            Create Memorial
          </Link>
          <Link
            href="/admin/profiles"
            className="inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-xl border border-[#2A2E33] bg-[#0B0D0F]/40 px-5 text-sm font-medium text-[#F5F1E8] transition duration-300 hover:border-gold/40"
          >
            <Users className="h-4 w-4" aria-hidden />
            View Memorials
          </Link>
        </div>
      </div>
    </div>
  );
}
