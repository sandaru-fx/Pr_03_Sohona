import { z } from "zod";

export const mediaPresignSchema = z.object({
  profileId: z.string().trim().min(1, "profileId is required"),
  setupToken: z.string().trim().min(1, "setupToken is required"),
  kind: z.enum(["PHOTO", "VIDEO", "VOICE"]),
  contentType: z.string().trim().min(1, "contentType is required"),
  sizeBytes: z.number().int().positive("sizeBytes must be a positive integer"),
  fileName: z.string().trim().min(1, "fileName is required").max(180),
});

export type MediaPresignInput = z.infer<typeof mediaPresignSchema>;
