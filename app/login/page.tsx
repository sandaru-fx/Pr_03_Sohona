import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminSession } from "@/lib/auth-guards";
import { signInWithGoogle } from "./actions";

function googleConfigured() {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() &&
      process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}

function errorMessage(code: string | undefined) {
  switch (code) {
    case "AccessDenied":
      return "This Google account is not on the temple admin allow-list.";
    case "Unauthorized":
      return "Please sign in with an allow-listed admin account.";
    case "OAuthAccountNotLinked":
      return "Could not link this Google account. Try again.";
    case "Configuration":
      return "Auth is not configured. Check Google OAuth env vars.";
    default:
      return code ? "Sign-in failed. Try again." : null;
  }
}

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (isAdminSession(session)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const message = errorMessage(params.error);
  const callbackUrl = params.callbackUrl ?? "/admin";
  const ready = googleConfigured();
  const allowlistSet = Boolean(process.env.ADMIN_EMAIL_ALLOWLIST?.trim());

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <div className="w-full max-w-md">
        <p className="text-sm tracking-wide text-zinc-500">Sohona</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Temple staff only. Sign in with a Google account on the admin
          allow-list.
        </p>

        {message ? (
          <p
            className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        {!ready ? (
          <p className="mt-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Google OAuth is not configured yet. Set{" "}
            <code className="font-mono text-xs">AUTH_GOOGLE_ID</code> and{" "}
            <code className="font-mono text-xs">AUTH_GOOGLE_SECRET</code> in{" "}
            <code className="font-mono text-xs">.env</code>.
          </p>
        ) : null}

        {!allowlistSet ? (
          <p className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Admin allow-list is empty. Set{" "}
            <code className="font-mono text-xs">ADMIN_EMAIL_ALLOWLIST</code> or
            nobody can sign in.
          </p>
        ) : null}

        <form className="mt-8" action={signInWithGoogle.bind(null, callbackUrl)}>
          <button
            type="submit"
            disabled={!ready}
            className="flex h-12 w-full items-center justify-center bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="underline underline-offset-4 hover:text-zinc-800">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
