import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/require-admin";

/**
 * Authoritative admin gate + SaaS shell (sidebar + content).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();

  return (
    <AdminShell userName={session.user.name} userEmail={session.user.email}>
      {children}
    </AdminShell>
  );
}
