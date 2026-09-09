"use client";

import { useState } from "react";
import { SetupContentForm } from "@/components/setup/SetupContentForm";
import { SetupPinForm } from "@/components/setup/SetupPinForm";
import { SetupSuccessCard } from "@/components/setup/SetupSuccessCard";

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
  const [step, setStep] = useState<"pin" | "content">(
    hasPin ? "content" : "pin",
  );
  const [complete, setComplete] = useState<CompleteState | null>(null);

  if (complete) {
    return (
      <SetupSuccessCard
        displayName={complete.displayName}
        manageUrl={complete.manageUrl}
        publicUrl={complete.publicUrl}
      />
    );
  }

  if (step === "pin") {
    return (
      <SetupPinForm
        profileId={profileId}
        displayName={displayName}
        setupToken={setupToken}
        expiresLabel={expiresLabel}
        onSaved={() => setStep("content")}
      />
    );
  }

  return (
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
  );
}
