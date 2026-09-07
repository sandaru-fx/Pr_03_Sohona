import Link from "next/link";
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
        Day 2 admin auth complete. App URL: {env.APP_URL}
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex h-11 items-center justify-center bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Admin login
      </Link>
    </main>
  );
}
