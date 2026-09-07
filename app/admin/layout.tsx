import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminSession } from "@/lib/auth-guards";
import { signOutAdmin } from "./actions";

/**
 * Authoritative admin gate (do not rely on proxy alone).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!isAdminSession(session)) {
    redirect("/login?error=Unauthorized&callbackUrl=/admin");
  }

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-wide text-zinc-500">Sohona Admin</p>
            <p className="text-sm text-zinc-700">
              {session.user.name ?? session.user.email}
            </p>
            {session.user.name && session.user.email ? (
              <p className="text-xs text-zinc-500">{session.user.email}</p>
            ) : null}
          </div>

          <form action={signOutAdmin}>
            <button
              type="submit"
              className="h-10 border border-zinc-300 bg-white px-4 text-sm text-zinc-800 transition hover:bg-zinc-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
