/**
 * Native Cloudflare Turnstile siteverify (no npm SDK).
 * Server-only — never call with the secret from the browser.
 */

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing_token" | "rejected" | "misconfigured" | "upstream" };

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

/**
 * Environment-aware Turnstile gate.
 * - Production (NODE_ENV=production): always requires secret + successful siteverify.
 * - Non-production: if site key and secret are both unset, skip (local/test without Turnstile).
 * - Partial config (only one of site/secret set) is always a misconfiguration failure.
 */
export function turnstileConfigured(): {
  siteKey: string | null;
  secretKey: string | null;
  required: boolean;
} {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim() || null;
  const isProduction = process.env.NODE_ENV === "production";
  const required = isProduction || Boolean(siteKey) || Boolean(secretKey);
  return { siteKey, secretKey, required };
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
): Promise<TurnstileVerifyResult> {
  const { siteKey, secretKey, required } = turnstileConfigured();

  if (!required) {
    return { ok: true };
  }

  if (!secretKey || !siteKey) {
    console.error("[turnstile] misconfigured: site key and secret must both be set");
    return { ok: false, reason: "misconfigured" };
  }

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return { ok: false, reason: "missing_token" };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secretKey);
    body.set("response", token.trim());

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    if (!response.ok) {
      console.error("[turnstile] siteverify HTTP", response.status);
      return { ok: false, reason: "upstream" };
    }

    const data = (await response.json()) as SiteverifyResponse;
    if (data.success === true) {
      return { ok: true };
    }

    console.warn("[turnstile] rejected", data["error-codes"] ?? []);
    return { ok: false, reason: "rejected" };
  } catch (error) {
    console.error("[turnstile] siteverify failed", error instanceof Error ? error.name : "unknown");
    return { ok: false, reason: "upstream" };
  }
}
