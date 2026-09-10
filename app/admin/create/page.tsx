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
import { ProgressSteps } from "@/components/ui/ProgressSteps";
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

function extractSuccess(data: ApiSuccess): {
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

const STEPS = ["Information", "Package", "Review", "QR & link"];

export default function CreateProfilePage() {
  const nameId = useId();
  const errorId = useId();
  const [wizardStep, setWizardStep] = useState(0);
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
    setWizardStep(0);
    setState({ status: "idle" });
  }

  function goNext() {
    if (wizardStep === 0) {
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
    }
    setWizardStep((step) => Math.min(step + 1, 2));
  }

  async function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setFieldError("Full name is required.");
      setWizardStep(0);
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
            "Could not create memorial. Please try again.",
        });
        return;
      }

      const success = extractSuccess(data);
      if (!success) {
        setState({
          status: "error",
          message:
            "Memorial created, but setup link or public URL was missing from the response.",
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
      setWizardStep(3);
    } catch {
      setState({
        status: "error",
        message: "Something went wrong. Check your connection and try again.",
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
    }
  }

  if (state.status === "success") {
    const pkg = PACKAGE_CATALOG[state.packageTier];
    return (
      <div className="space-y-6">
        <ProgressSteps steps={STEPS} current={3} />
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
                Memorial ready
              </h1>
              <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                Package {pkg.tier} · {pkg.retentionYears} years. Share the
                secure setup link with the family.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-foreground">
              Family setup link
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border bg-background-secondary px-4 py-3">
                <code className="block whitespace-nowrap font-mono text-sm text-foreground">
                  {state.setupUrl}
                </code>
              </div>
              <button
                type="button"
                onClick={() => void copySetupUrl(state.setupUrl)}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition",
                  copied
                    ? "bg-success text-background"
                    : "bg-gold text-background hover:bg-gold-hover",
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden />
                    Copied
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

          <div className="mt-6 flex gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-warning">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="text-sm leading-6">
              This setup link is one-time. Share it securely. After the family
              finishes setup, the link expires permanently. Retention years
              begin at setup complete.
            </p>
          </div>

          <div className="mt-6">
            <ProfileQrCard
              publicUrl={state.publicUrl}
              fileName={`sohona-qr-${state.profileId}.png`}
            />
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground transition hover:bg-background-secondary"
          >
            Create another memorial
          </button>
        </div>
      </div>
    );
  }

  const busy = state.status === "loading";
  const selected = PACKAGE_CATALOG[packageTier];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-medium tracking-tight text-[#F5F1E8]">
          Create Memorial
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Name-only profile, package selection, then QR and family setup link.
          You will never see private family memories.
        </p>
      </div>

      <ProgressSteps steps={STEPS} current={wizardStep} />

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        {wizardStep === 0 ? (
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Memorial information
            </h2>
            <label
              htmlFor={nameId}
              className="mt-5 block text-sm font-medium text-foreground"
            >
              Full name
            </label>
            <input
              id={nameId}
              name="displayName"
              type="text"
              autoComplete="name"
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
                "mt-2 h-11 w-full rounded-xl border bg-background-secondary px-3.5 text-sm text-foreground outline-none transition",
                "placeholder:text-foreground-muted focus-visible:ring-2 focus-visible:ring-gold",
                fieldError ? "border-error" : "border-border",
              )}
            />
            {fieldError ? (
              <p id={errorId} className="mt-2 text-sm text-error" role="alert">
                {fieldError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={goNext}
              className="mt-8 inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-medium text-background transition hover:bg-gold-hover"
            >
              Continue
            </button>
          </div>
        ) : null}

        {wizardStep === 1 ? (
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Select package
            </h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Content limits are identical. Years differ.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PACKAGE_TIERS.map((tier) => {
                const pkg = PACKAGE_CATALOG[tier];
                const active = packageTier === tier;
                return (
                  <label
                    key={tier}
                    className={cn(
                      "cursor-pointer rounded-xl border px-4 py-3 transition",
                      active
                        ? "border-gold bg-gold-subtle text-gold"
                        : "border-border bg-background-secondary text-foreground hover:border-gold/40",
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
                    <span className="mt-1 block text-xs opacity-80">
                      {pkg.retentionYears} years
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-foreground-muted">
              {selected.limits.maxImages} photos ·{" "}
              {selected.limits.maxVideoSeconds}s video ·{" "}
              {selected.limits.maxAudioSeconds}s audio ·{" "}
              {selected.limits.maxStatementWords} words
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setWizardStep(0)}
                className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-11 items-center rounded-xl bg-gold px-5 text-sm font-medium text-background hover:bg-gold-hover"
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {wizardStep === 2 ? (
          <div>
            <h2 className="text-sm font-medium text-foreground">Review</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-foreground-muted">Name</dt>
                <dd className="font-medium text-foreground">{name.trim()}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <dt className="text-foreground-muted">Package</dt>
                <dd className="font-medium text-foreground">
                  {selected.label}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-foreground-secondary">
              After create, you receive a one-time family setup link and a
              public QR. Retention starts when the family completes setup.
            </p>
            {state.status === "error" ? (
              <p
                className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
                role="alert"
              >
                {state.message}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setWizardStep(1)}
                className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-medium text-foreground disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onCreate()}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-background",
                  busy
                    ? "cursor-not-allowed bg-foreground-muted"
                    : "bg-gold hover:bg-gold-hover",
                )}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Creating…
                  </>
                ) : (
                  "Generate QR & setup link"
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
