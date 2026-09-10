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
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#0B0D0F] px-6 py-16 text-[#F5F1E8]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(201,164,92,0.1),transparent_55%)]"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-[#2A2E33] bg-[#181C20] px-6 py-10 sm:px-8 sm:py-12">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          Mathaka QR
        </p>
        <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight sm:text-4xl">
          Admin sign in
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-400">
          Temple staff only. Sign in with a Google account on the admin
          allow-list.
        </p>

        {message ? (
          <p
            className="mt-6 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        {!ready ? (
          <p className="mt-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Google OAuth is not configured yet. Set{" "}
            <code className="font-mono text-xs">AUTH_GOOGLE_ID</code> and{" "}
            <code className="font-mono text-xs">AUTH_GOOGLE_SECRET</code> in{" "}
            <code className="font-mono text-xs">.env</code>.
          </p>
        ) : null}

        {!allowlistSet ? (
          <p className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            Admin allow-list is empty. Set{" "}
            <code className="font-mono text-xs">ADMIN_EMAIL_ALLOWLIST</code> or
            nobody can sign in.
          </p>
        ) : null}

        <form className="mt-8" action={signInWithGoogle.bind(null, callbackUrl)}>
          <button
            type="submit"
            disabled={!ready}
            className="flex h-12 min-h-12 w-full items-center justify-center rounded-xl bg-gold px-5 text-sm font-medium text-[#0B0D0F] transition-opacity duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-[#0B0D0F]/70"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link
            href="/"
            className="text-gold transition-opacity duration-300 hover:opacity-80"
          >
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
