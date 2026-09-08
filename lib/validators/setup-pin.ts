import { z } from "zod";

export const setupPinSchema = z
  .object({
    profileId: z.string().trim().min(1),
    setupToken: z.string().trim().min(1),
    pin: z
      .string()
      .regex(/^\d{6}$/, "PIN must be exactly 6 digits."),
    confirmPin: z.string().min(1, "Please confirm your PIN."),
    isPublicPinRequired: z.boolean(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PIN and confirmation do not match.",
    path: ["confirmPin"],
  });

export type SetupPinInput = z.infer<typeof setupPinSchema>;
