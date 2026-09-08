import { z } from "zod";

export const managePinSchema = z.object({
  manageToken: z.string().trim().min(1).max(256),
  pin: z.string().regex(/^\d{6}$/, "PIN must be exactly 6 digits."),
});

export type ManagePinInput = z.infer<typeof managePinSchema>;
