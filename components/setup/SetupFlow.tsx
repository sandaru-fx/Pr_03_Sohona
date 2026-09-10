"use client";

import { useState } from "react";
import { SetupContentForm } from "@/components/setup/SetupContentForm";
import { SetupPinForm } from "@/components/setup/SetupPinForm";
import { SetupSuccessCard } from "@/components/setup/SetupSuccessCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressSteps } from "@/components/ui/ProgressSteps";

type SetupFlowProps = {
  profileId: string;
  displayName: string;
  setupToken: string;
  expiresLabel?: string | null;
  hasPin: boolean;
  r2Configured: boolean;
  packageTier: "A" | "B" | "C";
  initialStatements: Array<{ id: string; body: string }>;
  initialMedia: Array<{
    id: string;
    kind: "PHOTO" | "VIDEO" | "VOICE";
    originalName: string | null;
    sizeBytes: number;
    contentType: string;
    durationSeconds?: number | null;
  }>;
};

type CompleteState = {
  manageUrl: string;
  publicUrl: string;
  displayName: string;
};

const STEPS = ["Welcome", "PIN", "Memories", "Done"];

export function SetupFlow({
  profileId,
  displayName,
  setupToken,
  expiresLabel,
  hasPin,
  r2Configured,
  packageTier,
  initialStatements,
  initialMedia,
}: SetupFlowProps) {
  const [step, setStep] = useState<"welcome" | "pin" | "content">(
    hasPin ? "content" : "welcome",
  );
  const [complete, setComplete] = useState<CompleteState | null>(null);

  const progressIndex =
    complete !== null
      ? 3
      : step === "welcome"
        ? 0
        : step === "pin"
          ? 1
          : 2;

  if (complete) {
    return (
      <div className="w-full max-w-2xl space-y-4">
        <ProgressSteps steps={STEPS} current={3} />
        <SetupSuccessCard
          displayName={complete.displayName}
          manageUrl={complete.manageUrl}
          publicUrl={complete.publicUrl}
        />
      </div>
    );
  }

  if (step === "welcome") {
    return (
      <div className="w-full max-w-lg space-y-4">
        <ProgressSteps steps={STEPS} current={0} />
        <Card>
          <p className="text-sm tracking-wide text-gold">Family setup</p>
          <h1 className="mt-2 font-display text-3xl text-foreground">
            These memories belong to you
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground-secondary">
            You are setting up the memorial for{" "}
            <span className="font-medium text-foreground">{displayName}</span>.
            Choose a PIN to protect your family&apos;s memorial memories, then
            add statements and media at your pace.
          </p>
          {expiresLabel ? (
            <p className="mt-4 text-xs text-foreground-muted">
              Setup link expires {expiresLabel}.
            </p>
          ) : null}
          <Button
            className="mt-8 w-full"
            size="lg"
            onClick={() => setStep("pin")}
          >
            Begin setup
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div className="w-full max-w-lg space-y-4">
        <ProgressSteps steps={STEPS} current={1} />
        <SetupPinForm
          profileId={profileId}
          displayName={displayName}
          setupToken={setupToken}
          expiresLabel={expiresLabel}
          onSaved={() => setStep("content")}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <ProgressSteps steps={STEPS} current={progressIndex} />
      <SetupContentForm
        profileId={profileId}
        displayName={displayName}
        setupToken={setupToken}
        r2Configured={r2Configured}
        packageTier={packageTier}
        initialStatements={initialStatements}
        initialMedia={initialMedia}
        onComplete={setComplete}
      />
    </div>
  );
}
