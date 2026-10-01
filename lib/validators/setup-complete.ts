import { z } from "zod";

export const setupCompleteSchema = z.object({
  profileId: z.string().trim().min(1),
  setupToken: z.string().trim().min(1),
});

export type SetupCompleteInput = z.infer<typeof setupCompleteSchema>;
