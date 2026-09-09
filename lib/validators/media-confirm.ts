import { z } from "zod";

const baseMediaConfirm = {
  profileId: z.string().trim().min(1, "profileId is required"),
  setupToken: z.string().trim().min(1, "setupToken is required"),
  kind: z.enum(["PHOTO", "VIDEO", "VOICE"]),
  contentType: z.string().trim().min(1, "contentType is required"),
  sizeBytes: z.number().int().positive("sizeBytes must be a positive integer"),
  fileName: z.string().trim().min(1, "fileName is required").max(180),
  r2ObjectKey: z.string().trim().min(1, "r2ObjectKey is required").max(512),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  durationSeconds: z.number().positive().max(24 * 60 * 60).optional(),
};

export const mediaConfirmSchema = z
  .object(baseMediaConfirm)
  .superRefine((value, ctx) => {
    if (value.kind === "VIDEO" || value.kind === "VOICE") {
      if (
        typeof value.durationSeconds !== "number" ||
        !Number.isFinite(value.durationSeconds) ||
        value.durationSeconds <= 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["durationSeconds"],
          message: "durationSeconds is required for VIDEO and VOICE uploads.",
        });
      }
    }
  });

export type MediaConfirmInput = z.infer<typeof mediaConfirmSchema>;
