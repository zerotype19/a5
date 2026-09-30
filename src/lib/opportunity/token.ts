/**
 * A5-009 capability tokens.
 * The raw token is sent to the vendor once. Only the SHA-256 hex hash is stored.
 */

import { createHash, randomBytes } from "node:crypto";
import { OPPORTUNITY_TTL_HOURS } from "./policy.ts";

const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export function createOpportunityToken(now = new Date()): {
  raw: string;
  hash: string;
  expiresAt: Date;
} {
  const raw = randomBytes(32).toString("base64url");
  return {
    raw,
    hash: hashOpportunityToken(raw),
    expiresAt: new Date(now.getTime() + OPPORTUNITY_TTL_HOURS * 60 * 60 * 1000),
  };
}

export function hashOpportunityToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function isOpportunityToken(value: string): boolean {
  return TOKEN_RE.test(value);
}
