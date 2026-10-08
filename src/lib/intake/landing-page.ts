/**
 * First same-site pathname for a homeowner visit.
 * Stored once on the lead. Query strings, click IDs, and external origins
 * are discarded. /request-service is the form, not the landing page.
 */

const MAX_LENGTH = 200;

const SAFE_PATH =
  /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

const EXCLUDED =
  /^\/(?:request-service|admin|api|check-in|opportunity)(?:\/|$)/;

const SESSION_KEY = "a5.first_landing_page";

function isA5Origin(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (
    url.protocol === "https:" &&
    (host === "www.a5homeservices.com" || host === "a5homeservices.com")
  ) {
    return true;
  }
  if (
    url.protocol === "http:" &&
    (host === "localhost" || host === "127.0.0.1")
  ) {
    return true;
  }
  return false;
}

function isExcluded(pathname: string): boolean {
  return EXCLUDED.test(pathname);
}

function isSafePath(pathname: string): boolean {
  return pathname === "/" || SAFE_PATH.test(pathname);
}

/**
 * Reduce a client-supplied value to an A5-relative pathname, or null.
 * External origins, the intake form, and operational routes are rejected.
 */
export function normalizeFirstLandingPage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 500) return null;
  if (/[\s\\]/.test(trimmed) || trimmed.includes("%")) return null;

  let pathname = trimmed;
  if (trimmed.startsWith("//") || trimmed.includes("://")) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      return null;
    }
    if (!isA5Origin(url)) return null;
    pathname = url.pathname;
  } else if (trimmed.startsWith("/")) {
    pathname = trimmed.split(/[?#]/, 1)[0] ?? "";
  } else {
    return null;
  }

  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, "");
  }
  if (!pathname || pathname.length > MAX_LENGTH) return null;
  if (!isSafePath(pathname) || isExcluded(pathname)) return null;
  return pathname;
}

/**
 * First eligible pathname wins. A later page, including /request-service,
 * does not replace it. An ineligible current page leaves the stored value
 * unchanged.
 */
export function selectFirstLandingPath(
  stored: string | null,
  pathname: string,
): string | null {
  const kept = normalizeFirstLandingPage(stored);
  if (kept) return kept;
  return normalizeFirstLandingPage(pathname);
}

export function rememberFirstLandingPath(pathname: string): void {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    const next = selectFirstLandingPath(existing, pathname);
    if (next && next !== existing) {
      sessionStorage.setItem(SESSION_KEY, next);
    }
  } catch {
    // Private browsing can block sessionStorage. The request still submits.
  }
}

export function readFirstLandingPage(): string | null {
  try {
    return normalizeFirstLandingPage(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
