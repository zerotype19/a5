import { NextResponse, type NextRequest } from "next/server";
import { canonicalRedirectTarget } from "@/lib/host/canonical-redirect";
import { updateAdminSession } from "@/lib/supabase/middleware";

function requestProtocol(request: NextRequest): string {
  const visitor = request.headers.get("cf-visitor");
  if (visitor) {
    try {
      const scheme = (JSON.parse(visitor) as { scheme?: unknown }).scheme;
      if (typeof scheme === "string" && scheme.length > 0) return scheme;
    } catch {
      // Ignore a malformed CF-Visitor header and fall through.
    }
  }
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0] ?? forwarded;
  return request.nextUrl.protocol;
}

export async function middleware(request: NextRequest) {
  const target = canonicalRedirectTarget({
    host: request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    protocol: requestProtocol(request),
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });
  if (target) {
    return NextResponse.redirect(target, 301);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return updateAdminSession(request);
  }

  const response = NextResponse.next();
  if (/^\/(opportunity|check-in)(?:\/|$)/.test(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};
