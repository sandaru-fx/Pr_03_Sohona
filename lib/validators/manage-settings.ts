import { z } from "zod";

/** displayName and other profile fields stay read-only — reject unknowns. */
export const manageSettingsSchema = z
  .object({
    isPublicPinRequired: z.boolean(),
  })
  .strict();

export type ManageSettingsInput = z.infer<typeof manageSettingsSchema>;
