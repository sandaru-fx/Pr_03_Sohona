import { SetupGateCard } from "@/components/setup/SetupGateCard";
import { isR2Configured } from "@/lib/r2-config";
import { resolveSetupGate } from "@/lib/setup-lookup";

type SetupPageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return {
    title: "Family setup · Mathaka QR",
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Day 5 — setup gate → PIN → content → complete (Phases 5.1–5.5).
 */
export default async function SetupPage({ params }: SetupPageProps) {
  const { token: rawToken } = await params;
  const setupToken = decodeURIComponent(rawToken);
  const result = await resolveSetupGate(setupToken);

  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#0B0D0F] px-5 py-16 text-[#F5F1E8] sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(201,164,92,0.08),transparent_55%)]"
      />
      <div className="relative w-full max-w-2xl">
        <SetupGateCard
          result={result}
          setupToken={setupToken}
          r2Configured={isR2Configured()}
        />
      </div>
    </main>
  );
}
