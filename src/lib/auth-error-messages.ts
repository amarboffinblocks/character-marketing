/**
 * Maps Supabase Auth / network errors to stable, user-facing copy for the Character Market auth UI.
 */
export type AuthErrorContext = "sign-in" | "sign-up" | "otp" | "resend" | "forgot-password"

export function mapSupabaseAuthError(message: string | undefined | null, context: AuthErrorContext): string {
  const raw = (message ?? "").trim()
  const m = raw.toLowerCase()

  if (!raw) {
    return context === "sign-in"
      ? "We could not sign you in. Please check your details and try again."
      : "Something went wrong. Please try again."
  }

  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "That email or password is incorrect. Try again or reset your password."
  }

  if (m.includes("email not confirmed") || m.includes("email address not confirmed")) {
    return "Please verify your email first. Enter the code we sent you, or request a new one from the verification page."
  }

  if (
    m.includes("already registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already registered") ||
    m.includes("already exists")
  ) {
    return "This account is already registered. Please sign in instead."
  }

  if (m.includes("otp") && (m.includes("expired") || m.includes("invalid"))) {
    return "This code is invalid or has expired. Request a new code and try again."
  }

  if (m.includes("token") && (m.includes("expired") || m.includes("invalid"))) {
    return context === "otp"
      ? "This code is invalid or has expired. Request a new code and try again."
      : "This link or code is invalid or has expired. Request a new one."
  }

  if (m.includes("rate limit") || m.includes("too many requests") || m.includes("email rate limit")) {
    return "Too many attempts. Please wait a few minutes before trying again."
  }

  if (m.includes("network") || m.includes("fetch failed") || m.includes("failed to fetch")) {
    return "Network error. Check your connection and try again."
  }

  if (m.includes("password") && m.includes("weak")) {
    return "That password is too weak. Use at least 8 characters and avoid common patterns."
  }

  if (m.includes("invalid email")) {
    return "Enter a valid email address."
  }

  return raw.length > 180 ? `${raw.slice(0, 177)}…` : raw
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && String(error.message).toLowerCase().includes("fetch")
}
