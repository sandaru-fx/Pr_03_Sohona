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
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-background-secondary px-6 py-16 text-foreground">
      <div className="w-full max-w-md">
        <p className="text-sm tracking-wide text-foreground-muted">Sohona</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground-secondary">
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
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gold px-5 text-sm font-medium text-background transition hover:bg-gold-hover disabled:cursor-not-allowed disabled:bg-foreground-muted"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
