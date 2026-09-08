type ManageStubProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return {
    title: "Manage memorial · Sohona",
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Day 5 stub — manage-link target.
 * Owner edit flow lands in Day 9.
 */
export default async function ManageStubPage({ params }: ManageStubProps) {
  const { token } = await params;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm tracking-wide text-zinc-500">Sohona</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Private manage link
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          This manage link is valid. Owner editing (PIN gate + update memories)
          will be available in a later phase.
        </p>
        <p className="mt-6 rounded-xl bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-500 break-all">
          token: {token.slice(0, 8)}…
        </p>
      </div>
    </main>
  );
}
