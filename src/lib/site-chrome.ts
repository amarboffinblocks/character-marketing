/**
 * Paths where the global site header and footer are omitted.
 * Add a RegExp per route; first match wins (order only matters if patterns overlap).
 */
export const HIDE_SITE_CHROME_PATTERNS: readonly RegExp[] = [
  /^\/creators\/[^/]+\/custom-package/,
]

export function shouldHideSiteChrome(pathname: string | null | undefined): boolean {
  if (pathname == null || pathname === "") {
    return false
  }
  return HIDE_SITE_CHROME_PATTERNS.some((pattern) => pattern.test(pathname))
}
