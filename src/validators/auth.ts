import { z } from "zod";

export const authFormSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email-template." })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});

export const otpFormSchema = z.object({
  otp: z.string().length(6, { message: "error.otp_len" }).trim(),
});
