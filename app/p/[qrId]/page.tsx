type PublicProfileStubProps = {
  params: Promise<{ qrId: string }>;
};

/**
 * Day 3 stub — QR target route.
 * Full public memorial view lands in Day 6.
 */
export default async function PublicProfileStubPage({
  params,
}: PublicProfileStubProps) {
  const { qrId } = await params;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm tracking-wide text-zinc-500">Sohona</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Memorial profile
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          This QR code is linked correctly. The full public memorial experience
          (PIN gate + media) will be available in a later phase.
        </p>
        <p className="mt-6 rounded-xl bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-500 break-all">
          qrId: {qrId}
        </p>
      </div>
    </main>
  );
}
