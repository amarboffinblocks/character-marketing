import { z } from "zod"

import { SIGN_IN_ALLOWED_ROLES } from "@/lib/auth-roles"

/** Supabase `{{ .Token }}` is often 6 digits; some projects/templates send 8. */
export const emailSignupOtpCodeSchema = z
  .string()
  .regex(/^\d+$/, "Use only numbers")
  .refine((s) => s.length === 6 || s.length === 8, "Enter the full code from your email (6 or 8 digits)")

const trimmedEmail = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.email("Enter a valid email"),
)

export const signUpRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: trimmedEmail,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^\S+$/, "Password cannot contain spaces"),
  role: z.enum(SIGN_IN_ALLOWED_ROLES),
})

export const verifySignupOtpSchema = z.object({
  email: trimmedEmail,
  token: emailSignupOtpCodeSchema,
  role: z.enum(SIGN_IN_ALLOWED_ROLES).optional(),
})

export const emailOnlySchema = z.object({
  email: trimmedEmail,
})

export const resendSignupSchema = z.object({
  email: trimmedEmail,
  role: z.enum(SIGN_IN_ALLOWED_ROLES).optional(),
})

export const signInRequestSchema = z.object({
  email: trimmedEmail,
  password: z.string().min(8, "Password must be at least 8 characters"),
})
