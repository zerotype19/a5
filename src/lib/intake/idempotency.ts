/**
 * Application-boundary idempotency for double-click / retry protection.
 * In-process only — no schema change. Multi-instance duplicates remain possible;
 * a durable DB key would need a separate owner-approved migration proposal.
 */

type Entry = { expiresAt: number; publicReference: string };

const TTL_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 5_000;

const store = new Map<string, Entry>();

function prune(now: number) {
  if (store.size < MAX_ENTRIES) {
    for (const [key, entry] of store) {
      if (entry.expiresAt <= now) store.delete(key);
    }
    return;
  }
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
}

export function getIdempotentResult(key: string | null | undefined): string | null {
  if (!key || key.length < 8 || key.length > 128) return null;
  const now = Date.now();
  prune(now);
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    store.delete(key);
    return null;
  }
  return entry.publicReference;
}

export function rememberIdempotentResult(
  key: string | null | undefined,
  publicReference: string,
): void {
  if (!key || key.length < 8 || key.length > 128) return;
  const now = Date.now();
  prune(now);
  store.set(key, { expiresAt: now + TTL_MS, publicReference });
}

/** Test helper — clears the in-memory store. */
export function clearIdempotencyStoreForTests(): void {
  store.clear();
}
