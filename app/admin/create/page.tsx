"use client";

import { useId, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
} from "lucide-react";
import { ProfileQrCard } from "@/components/admin/ProfileQrCard";
import {
  PACKAGE_CATALOG,
  PACKAGE_TIERS,
  type PackageTierId,
} from "@/lib/packages";
import { cn } from "@/lib/utils";

type CreateState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      setupUrl: string;
      profileId: string;
      publicUrl: string;
      packageTier: PackageTierId;
    }
  | { status: "error"; message: string };

type ApiSuccess = {
  profile?: { id?: string; qrId?: string; packageTier?: string };
  setup?: { url?: string };
  setupUrl?: string;
  profileId?: string;
  publicUrl?: string;
  error?: string;
  message?: string;
  issues?: Array<{ message: string }>;
};

function extractSuccess(
  data: ApiSuccess,
): {
  setupUrl: string;
  profileId: string;
  publicUrl: string;
  packageTier: PackageTierId;
} | null {
  const setupUrl = data.setup?.url ?? data.setupUrl;
  const profileId = data.profile?.id ?? data.profileId;
  const publicUrl = data.publicUrl;
  const rawTier = data.profile?.packageTier;
  const packageTier =
    rawTier === "A" || rawTier === "B" || rawTier === "C" ? rawTier : null;
  if (!setupUrl || !profileId || !publicUrl || !packageTier) return null;
  return { setupUrl, profileId, publicUrl, packageTier };
}

export default function CreateProfilePage() {
  const nameId = useId();
  const errorId = useId();
  const [name, setName] = useState("");
  const [packageTier, setPackageTier] = useState<PackageTierId>("A");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [state, setState] = useState<CreateState>({ status: "idle" });
  const [copied, setCopied] = useState(false);

  function resetForm() {
    setName("");
    setPackageTier("A");
    setFieldError(null);
    setCopied(false);
    setState({ status: "idle" });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError("Full name is required.");
      return;
    }
    if (trimmed.length < 2) {
      setFieldError("Full name must be at least 2 characters.");
      return;
    }

    setFieldError(null);
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmed, packageTier }),
      });

      const data = (await response.json().catch(() => ({}))) as ApiSuccess;

      if (!response.ok) {
        const issueMessage = data.issues?.[0]?.message;
        setState({
          status: "error",
          message:
            issueMessage ??
            data.message ??
            data.error ??
            "Could not create profile. Please try again.",
        });
        return;
      }

      const success = extractSuccess(data);
      if (!success) {
        setState({
          status: "error",
          message:
            "Profile created, but setup link or public URL was missing from the response.",
        });
        return;
      }

      setState({
        status: "success",
        setupUrl: success.setupUrl,
        profileId: success.profileId,
        publicUrl: success.publicUrl,
        packageTier: success.packageTier,
      });
    } catch {
      setState({
        status: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }

  async function copySetupUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      window.alert(
        "Could not copy automatically. Please select and copy the link manually.",
      );
    }
  }

  if (state.status === "success") {
    const pkg = PACKAGE_CATALOG[state.packageTier];
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Profile Created Successfully
              </h1>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Package {pkg.tier} · {pkg.retentionYears} years. Share the
                secure setup link with the family.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-zinc-900">Secure setup link</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <code className="block whitespace-nowrap font-mono text-sm text-zinc-800">
                  {state.setupUrl}
                </code>
              </div>
              <button
                type="button"
                onClick={() => copySetupUrl(state.setupUrl)}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 text-white hover:bg-zinc-800",
                )}
                aria-label={copied ? "Copied setup link" : "Copy setup link"}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div
            className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950"
            role="status"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
              aria-hidden
            />
            <p className="text-sm leading-6">
              Important: This setup link is for one-time use only. Please share
              it securely with the family. Once the family completes the setup,
              this link will permanently expire.
            </p>
          </div>

          <div className="mt-6">
            <ProfileQrCard
              publicUrl={state.publicUrl}
              fileName={`sohona-qr-${state.profileId}.png`}
            />
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              Create Another Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const busy = state.status === "loading";
  const selected = PACKAGE_CATALOG[packageTier];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Create New Memorial Profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Enter the person&apos;s full name and choose package A, B, or C.
          Content limits are the same; retention years differ.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        noValidate
      >
        <div>
          <label
            htmlFor={nameId}
            className="block text-sm font-medium text-zinc-900"
          >
            Full Name
          </label>
          <input
            id={nameId}
            name="displayName"
            type="text"
            autoComplete="name"
            required
            disabled={busy}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (fieldError) setFieldError(null);
            }}
            placeholder="Enter full name"
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? errorId : undefined}
            className={cn(
              "mt-2 h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-zinc-900 shadow-sm outline-none transition",
              "placeholder:text-zinc-400",
              "focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
              fieldError
                ? "border-red-300 focus-visible:ring-red-600"
                : "border-zinc-200 hover:border-zinc-300",
            )}
          />
          {fieldError ? (
            <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
              {fieldError}
            </p>
          ) : null}
        </div>

        <fieldset className="mt-8" disabled={busy}>
          <legend className="text-sm font-medium text-zinc-900">Package</legend>
          <p className="mt-1 text-sm text-zinc-600">
            Same media and word limits on every package. Years = how long the
            memorial is designed to be kept.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PACKAGE_TIERS.map((tier) => {
              const pkg = PACKAGE_CATALOG[tier];
              const active = packageTier === tier;
              return (
                <label
                  key={tier}
                  className={cn(
                    "cursor-pointer rounded-xl border px-4 py-3 transition",
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300",
                    busy && "cursor-not-allowed opacity-70",
                  )}
                >
                  <input
                    type="radio"
                    name="packageTier"
                    value={tier}
                    checked={active}
                    onChange={() => setPackageTier(tier)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold">
                    Package {pkg.tier}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      active ? "text-zinc-300" : "text-zinc-500",
                    )}
                  >
                    {pkg.retentionYears} years
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Selected: {selected.label} · {selected.limits.maxImages} photos ·{" "}
            {selected.limits.maxVideoSeconds}s video ·{" "}
            {selected.limits.maxAudioSeconds}s audio ·{" "}
            {selected.limits.maxStatementWords} words
          </p>
        </fieldset>

        {state.status === "error" ? (
          <p
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <div className="mt-8">
          <button
            type="submit"
            disabled={busy}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition sm:w-auto",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
              busy
                ? "cursor-not-allowed bg-zinc-400"
                : "bg-zinc-900 hover:bg-zinc-800",
            )}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Generating profile…
              </>
            ) : (
              "Generate Profile & Setup Link"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
