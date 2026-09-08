import { z } from "zod";

export const publicPinSchema = z.object({
  qrId: z.string().trim().min(1).max(128),
  pin: z.string().regex(/^\d{6}$/, "PIN must be exactly 6 digits."),
});

export type PublicPinInput = z.infer<typeof publicPinSchema>;
