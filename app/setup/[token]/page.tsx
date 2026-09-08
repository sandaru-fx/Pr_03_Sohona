import { SetupGateCard } from "@/components/setup/SetupGateCard";
import { isR2Configured } from "@/lib/r2-config";
import { resolveSetupGate } from "@/lib/setup-lookup";

type SetupPageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return {
    title: "Family setup · Sohona",
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
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <SetupGateCard
        result={result}
        setupToken={setupToken}
        r2Configured={isR2Configured()}
      />
    </main>
  );
}
