type SetupStubProps = {
  params: Promise<{ token: string }>;
};

/**
 * Day 3 stub — one-time setup link target.
 * Family PIN + uploads land in Day 5.
 */
export default async function SetupStubPage({ params }: SetupStubProps) {
  await params;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm tracking-wide text-zinc-500">Sohona</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Family setup
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          This secure setup link is valid. The family setup flow (PIN, photos,
          memories) will be enabled in Day 5.
        </p>
      </div>
    </main>
  );
}
