import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL

const CHANNELS = ["retail", "professional"] as const

const SHARED_PREFIXES = [
  "/account",
  "/checkout",
  "/cart",
  "/blog",
  "/order",
  "/practitioner",
  "/about",
  "/contact",
  "/gift-cards",
  "/search",
  "/visit-us",
  "/privacy-policy",
  "/terms-of-service",
  "/return-policy",
  "/shipping-policy",
]

function buildCspHeader(nonce: string): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://www.google-analytics.com https://region1.google-analytics.com https://medusa-public-images.s3.eu-west-1.amazonaws.com https://medusa-server-testing.s3.amazonaws.com https://medusa-server-testing.s3.us-east-1.amazonaws.com https://placehold.co",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    `connect-src 'self' https://api.stripe.com https://*.stripe.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com ${BACKEND_URL || ""}`.trim(),
    "worker-src 'self' blob:",
  ]

  if (process.env.NODE_ENV === "development") {
    directives[directives.length - 2] += " ws://localhost:*"
  }

  return directives.join("; ")
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const cspHeader = buildCspHeader(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  function nextWithCsp(): NextResponse {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set("Content-Security-Policy", cspHeader)
    return res
  }

  function redirectWithCsp(url: string): NextResponse {
    const res = NextResponse.redirect(new URL(url, request.url), 307)
    res.headers.set("Content-Security-Policy", cspHeader)
    return res
  }

  const { pathname } = request.nextUrl
  const firstSegment = pathname.split("/")[1]?.toLowerCase()

  // 1. Channel routes — set cookie and pass through
  if ((CHANNELS as readonly string[]).includes(firstSegment)) {
    const res = nextWithCsp()
    res.cookies.set("_tw_channel", firstSegment, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      path: "/",
    })
    return res
  }

  // 2. Root "/" — check cookie for returning user redirect
  if (pathname === "/") {
    const channelCookie = request.cookies.get("_tw_channel")?.value
    if (channelCookie && (CHANNELS as readonly string[]).includes(channelCookie)) {
      return redirectWithCsp(`/${channelCookie}?from=redirect`)
    }
    return nextWithCsp()
  }

  // 3. Shared routes — pass through
  if (SHARED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return nextWithCsp()
  }

  // 4. Static assets — pass through
  if (pathname.includes(".")) {
    return nextWithCsp()
  }

  // 5. API and internal routes — pass through
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return nextWithCsp()
  }

  // 6. Everything else — redirect to root
  return redirectWithCsp("/")
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
