export const AUTH_ROLES = ["user", "creator", "admin"] as const

export type AuthRole = (typeof AUTH_ROLES)[number]

export const SIGN_IN_ALLOWED_ROLES = ["user", "creator"] as const

export type SignInAllowedRole = (typeof SIGN_IN_ALLOWED_ROLES)[number]

export function isAuthRole(value: unknown): value is AuthRole {
  return typeof value === "string" && AUTH_ROLES.includes(value as AuthRole)
}

export function isSignInAllowedRole(value: unknown): value is SignInAllowedRole {
  return typeof value === "string" && SIGN_IN_ALLOWED_ROLES.includes(value as SignInAllowedRole)
}

export function resolveUserRole(user: {
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}): AuthRole | null {
  const appRole = user.app_metadata?.role
  if (isAuthRole(appRole)) return appRole

  const userRole = user.user_metadata?.role
  if (isAuthRole(userRole)) return userRole

  return null
}
