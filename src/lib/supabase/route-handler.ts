import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

function appendSetCookieHeaders(from: NextResponse, onto: NextResponse) {
  const list = from.headers.getSetCookie?.() ?? []
  for (const value of list) {
    onto.headers.append("Set-Cookie", value)
  }
}

/**
 * Supabase client for Route Handlers where auth must read/write cookies on the
 * same {@link NextRequest} / outgoing {@link NextResponse} (OAuth PKCE + session).
 */
export function createRouteHandlerSupabaseClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  }

  const cookieJar = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => {
          try {
            request.cookies.set(name, value)
          } catch {
            // Request cookies may be immutable in some contexts; session still goes on cookieJar.
          }
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieJar.cookies.set(name, value, options)
        })
        if (cacheHeaders && typeof cacheHeaders === "object") {
          for (const [headerName, headerValue] of Object.entries(cacheHeaders)) {
            if (typeof headerValue === "string") {
              cookieJar.headers.set(headerName, headerValue)
            }
          }
        }
      },
    },
  })

  return {
    supabase,
    /** Append auth cookies collected during the handler onto your final response. */
    applyAuthCookiesTo(response: NextResponse) {
      appendSetCookieHeaders(cookieJar, response)
    },
  }
}
