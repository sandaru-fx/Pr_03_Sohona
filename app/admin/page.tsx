/**
 * Day 2 Phase 2.5 — Admin dashboard shell.
 * Create Profile becomes real in Day 3.
 */
export default function AdminPage() {
  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
        Create memorial profiles, generate setup links, and issue QR codes.
        Private family media stays invisible to temple admins.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled
          title="Coming in Day 3"
          className="h-11 bg-zinc-900 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          Create Profile
        </button>
        <p className="text-sm text-zinc-500">Placeholder — wired in Day 3</p>
      </div>

      <section className="mt-10 border-t border-zinc-200 pt-8">
        <h2 className="text-sm font-medium text-zinc-900">Profiles</h2>
        <p className="mt-2 text-sm text-zinc-600">
          No profiles yet. Day 3 adds creation + QR + setup token flow.
        </p>
      </section>
    </main>
  );
}
