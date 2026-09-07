import { getServerEnv } from "@/lib/env";

export default function Home() {
  const env = getServerEnv();

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <p className="text-sm tracking-wide text-zinc-500">Sohona</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
        Digital Legacy Platform
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-zinc-600">
        Phase 2 env config is active. App URL: {env.APP_URL}
      </p>
    </main>
  );
}
