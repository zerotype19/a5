/**
 * Resend HTTP API. No SDK. ADR-005 is the only approved email provider.
 * The API key stays in the Worker secret RESEND_API_KEY and is never logged.
 */

import { VENDOR_EMAIL_FROM } from "../opportunity/email.ts";
import { SITE } from "../../../config/site.ts";

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "email_not_configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(input.idempotencyKey ? {"Idempotency-Key": input.idempotencyKey} : {}),
      },
      body: JSON.stringify({
        from: VENDOR_EMAIL_FROM,
        to: [input.to],
        reply_to: SITE.email,
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return { ok: false, error: `provider_${response.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "provider_unreachable" };
  } finally {
    clearTimeout(timer);
  }
}
