"use client";

import { useState } from "react";
import { SetupContentForm } from "@/components/setup/SetupContentForm";
import { SetupPinForm } from "@/components/setup/SetupPinForm";
import { SetupSuccessCard } from "@/components/setup/SetupSuccessCard";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { motion, AnimatePresence } from "framer-motion";

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

  const pageVariants = {
    initial: { opacity: 0, y: 15, filter: "blur(4px)" },
    in: { opacity: 1, y: 0, filter: "blur(0px)" },
    out: { opacity: 0, y: -15, filter: "blur(4px)" }
  };
  const pageTransition = {
    type: "spring", stiffness: 300, damping: 25
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <div className="w-full mb-8">
        <ProgressSteps steps={STEPS} current={progressIndex} />
      </div>

      <AnimatePresence mode="wait">
        {complete ? (
          <motion.div 
            key="complete"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
            className="w-full"
          >
            <SetupSuccessCard
              displayName={complete.displayName}
              manageUrl={complete.manageUrl}
              publicUrl={complete.publicUrl}
            />
          </motion.div>
        ) : step === "welcome" ? (
          <motion.div 
            key="welcome"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-[#2A2E33]/60 bg-surface/80 px-6 py-10 sm:px-8 sm:py-12 shadow-[0_0_40px_-10px_rgba(212,175,55,0.05)] backdrop-blur-md">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
                Family setup
              </p>
              <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight text-[#F5F1E8] sm:text-4xl">
                These memories belong to you
              </h1>
              <p className="mt-4 text-base leading-7 text-foreground-secondary">
                You are setting up the memorial for{" "}
                <span className="font-medium text-[#F5F1E8]">{displayName}</span>.
                Choose a PIN to protect your family&apos;s memories, then add
                statements and media at your pace.
              </p>
              {expiresLabel ? (
                <p className="mt-5 text-xs leading-6 text-foreground-muted">
                  Setup link expires {expiresLabel}.
                </p>
              ) : null}
              <Button
                className="mt-10 w-full rounded-xl h-12 shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                size="lg"
                onClick={() => setStep("pin")}
              >
                Begin setup
              </Button>
            </div>
          </motion.div>
        ) : step === "pin" ? (
          <motion.div 
            key="pin"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
            className="w-full max-w-md"
          >
            <SetupPinForm
              profileId={profileId}
              displayName={displayName}
              setupToken={setupToken}
              expiresLabel={expiresLabel}
              onSaved={() => setStep("content")}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial="initial" animate="in" exit="out"
            variants={pageVariants} transition={pageTransition}
            className="w-full max-w-2xl"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
