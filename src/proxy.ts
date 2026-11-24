import { NextResponse, type NextRequest } from "next/server"

/**
 * Sends www.example.com to example.com when BETTER_AUTH_URL is the bare domain,
 * so sessions and page links always live on one host.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? ""
  if (!host.startsWith("www.") || !process.env.BETTER_AUTH_URL) return

  let canonical: URL
  try {
    canonical = new URL(process.env.BETTER_AUTH_URL)
  } catch {
    return
  }
  if (canonical.host !== host.slice(4)) return

  const { pathname, search } = request.nextUrl
  return NextResponse.redirect(new URL(pathname + search, canonical.origin), 308)
}

export const config = {
  matcher: "/((?!_next/static|_next/image|api/health).*)",
}
