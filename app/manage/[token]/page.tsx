import { ManageGateCard } from "@/components/manage/ManageGateCard";
import { loadManageOwnerContent } from "@/lib/manage-content";
import { resolveManageGate } from "@/lib/manage-lookup";
import { hasValidManageSession } from "@/lib/manage-session";
import { isR2Configured } from "@/lib/r2-config";

type ManagePageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ManagePageProps) {
  const { token: rawToken } = await params;
  const result = await resolveManageGate(decodeURIComponent(rawToken));

  if (result.status === "ready") {
    return {
      title: `Manage · ${result.profile.displayName} · Mathaka QR`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Manage memorial · Mathaka QR",
    robots: { index: false, follow: false },
  };
}

/**
 * Day 9 — manage-link gate + PIN session + owner edit dashboard (9.4).
 */
export default async function ManagePage({ params }: ManagePageProps) {
  const { token: rawToken } = await params;
  const manageToken = decodeURIComponent(rawToken);
  const result = await resolveManageGate(manageToken);

  const hasManageSession =
    result.status === "ready"
      ? await hasValidManageSession(result.profile.id)
      : false;

  const ownerContent =
    result.status === "ready" && hasManageSession
      ? await loadManageOwnerContent(result.profile.id)
      : null;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center bg-background px-6 py-12 text-foreground sm:py-16">
      <ManageGateCard
        result={result}
        manageToken={manageToken}
        hasManageSession={hasManageSession}
        ownerContent={ownerContent}
        r2Configured={isR2Configured()}
      />
    </main>
  );
}
