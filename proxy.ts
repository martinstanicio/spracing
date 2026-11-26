import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/panel") && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname === "/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/panel", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*", "/login"],
}
