/** Default prefix for creator dashboard workspace routes. */
export const DEFAULT_WORKSPACE_BASE = "/dashboard/creator/workspace" as const

/** Site “Inventory” area (no dashboard sidebar) mirrors the same workspace UI. */
export const SITE_INVENTORY_BASE = "/inventory" as const

export function workspacePath(base: string, ...segments: string[]) {
  const root = base.replace(/\/$/, "")
  const path = segments
    .map((s) => s.replace(/^\//, "").replace(/\/$/, ""))
    .filter(Boolean)
    .join("/")
  return path.length > 0 ? `${root}/${path}` : root
}
