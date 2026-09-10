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
    <main className="relative flex min-h-full flex-1 flex-col items-center overflow-hidden bg-[#0B0D0F] px-5 py-12 text-[#F5F1E8] sm:px-6 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(201,164,92,0.06),transparent_55%)]"
      />
      <div className="relative w-full max-w-2xl">
        <ManageGateCard
          result={result}
          manageToken={manageToken}
          hasManageSession={hasManageSession}
          ownerContent={ownerContent}
          r2Configured={isR2Configured()}
        />
      </div>
    </main>
  );
}
