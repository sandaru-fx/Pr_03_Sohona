import { Shield, UserPlus } from "lucide-react";
import { requireAdminPage } from "@/lib/require-admin";
import { getAdminAllowlist } from "@/lib/admin-allowlist";
import { prisma } from "@/lib/prisma";
import { AdminListClient } from "./AdminListClient";
import { TempleSettingsClient } from "./TempleSettingsClient";

export const metadata = {
  title: "Settings — Admin",
};

export default async function AdminSettingsPage() {
  const session = await requireAdminPage();

  // Build the combined admin list (env + DB)
  const envEmails = getAdminAllowlist();
  const dbInvites = await prisma.adminInvite.findMany({
    orderBy: { createdAt: "asc" },
  });

  const dbEmails = new Set(dbInvites.map((i) => i.email));
  const envOnly = envEmails
    .filter((e) => !dbEmails.has(e))
    .map((email) => ({
      id: null as null,
      email,
      addedBy: "Environment variable",
      createdAt: null as null,
      isEnv: true,
    }));

  const allEmails = [...envEmails, ...dbInvites.map((i) => i.email)];
  const users = await prisma.user.findMany({
    where: { email: { in: allEmails } },
    select: { email: true, name: true, image: true, isDisabled: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.email ?? "", u]));

  const admins = [
    ...envOnly,
    ...dbInvites.map((i) => ({
      id: i.id,
      email: i.email,
      addedBy: i.addedBy,
      createdAt: i.createdAt?.toISOString() ?? null,
      isEnv: false,
    })),
  ].map((entry) => ({
    ...entry,
    user: userMap[entry.email] ?? null,
  }));

  // Fetch Temple Settings
  let templeSettings = await prisma.templeSettings.findFirst();
  if (!templeSettings) {
    templeSettings = await prisma.templeSettings.create({
      data: { templeName: "Mathaka QR Temple" }
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
          Manage who can access the admin panel. Add or remove temple staff Gmail accounts.
        </p>
      </div>

      {/* Temple Settings section */}
      <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-6 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-subtle text-gold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-semibold text-[#F5F1E8]">
              Temple Profile
            </h2>
            <p className="text-xs text-foreground-muted">
              Public contact information shown on memorial QR pages.
            </p>
          </div>
        </div>

        <TempleSettingsClient initial={templeSettings} />
      </div>

      {/* Admin access section */}
      <div className="rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-6 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-subtle text-gold">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-semibold text-[#F5F1E8]">
              Admin access
            </h2>
            <p className="text-xs text-foreground-muted">
              Only listed emails can sign in via Google. The first super-admin is set via env variable.
            </p>
          </div>
        </div>

        <AdminListClient
          initial={admins}
          currentEmail={session.user.email ?? ""}
        />
      </div>
    </div>
  );
}
