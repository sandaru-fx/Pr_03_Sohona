import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { listAdminProfiles } from "@/lib/admin-profiles";
import { Card } from "@/components/ui/Card";

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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Create memorial profiles and issue secure family setup links. Private
          family media stays invisible to temple admins.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total memorials", value: profiles.length },
          { label: "Active memorials", value: complete },
          { label: "Pending family setup", value: pending },
          { label: "Expiring soon", value: expiringSoon },
        ].map((item) => (
          <Card key={item.label} className="p-5 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
              {item.label}
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-sm font-medium text-foreground">Quick actions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-medium text-background transition hover:bg-gold-hover"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            Create Memorial
          </Link>
          <Link
            href="/admin/profiles"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground transition hover:border-gold/40"
          >
            <Users className="h-4 w-4" aria-hidden />
            View Memorials
          </Link>
        </div>
      </Card>
    </div>
  );
}
