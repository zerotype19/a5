import { createHmac, timingSafeEqual } from "node:crypto";

const GRANT_TTL_MS = 15 * 60 * 1000;

function signingSecret(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("upload_grant_secret_missing");
  }
  // Domain-separated key material — not sent to the browser.
  return `a5-photo-upload-grant:v1:${key}`;
}

export type PhotoUploadGrantPayload = {
  v: 1;
  leadId: string;
  submissionKey: string;
  paths: string[];
  exp: number;
};

function encodePayload(payload: PhotoUploadGrantPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(raw: string): PhotoUploadGrantPayload | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as PhotoUploadGrantPayload;
    if (
      parsed?.v !== 1 ||
      typeof parsed.leadId !== "string" ||
      typeof parsed.submissionKey !== "string" ||
      !Array.isArray(parsed.paths) ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function sign(body: string): string {
  return createHmac("sha256", signingSecret()).update(body).digest("base64url");
}

/**
 * Short-lived server-issued capability for post-lead photo upload.
 * Not lead_id or public_reference — requires HMAC over lead + submission + paths.
 */
export function issuePhotoUploadGrant(input: {
  leadId: string;
  submissionKey: string;
  paths: string[];
}): string {
  const payload: PhotoUploadGrantPayload = {
    v: 1,
    leadId: input.leadId,
    submissionKey: input.submissionKey,
    paths: [...input.paths],
    exp: Date.now() + GRANT_TTL_MS,
  };
  const body = encodePayload(payload);
  return `${body}.${sign(body)}`;
}

export function verifyPhotoUploadGrant(
  token: string | null | undefined,
  expected: { submissionKey: string },
):
  | { ok: true; payload: PhotoUploadGrantPayload }
  | { ok: false; reason: string } {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { ok: false, reason: "missing_grant" };
  }
  const [body, sig] = token.split(".");
  if (!body || !sig) return { ok: false, reason: "malformed_grant" };

  let expectedSig: string;
  try {
    expectedSig = sign(body);
  } catch {
    return { ok: false, reason: "grant_misconfigured" };
  }

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid_grant" };
  }

  const payload = decodePayload(body);
  if (!payload) return { ok: false, reason: "malformed_grant" };
  if (payload.exp < Date.now()) return { ok: false, reason: "grant_expired" };
  if (payload.submissionKey !== expected.submissionKey) {
    return { ok: false, reason: "grant_mismatch" };
  }
  return { ok: true, payload };
}
