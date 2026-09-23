# DEPENDENCY PROPOSAL — A5-006

**Date:** 2026-09-23  
**Task:** A5-006 Admin Authentication + A5 Operations Shell  
**Status:** AWAITING OWNER APPROVAL  
**Do not `npm install` until approved.**

---

## ISSUE

A5-006 requires a secure admin surface:

1. `/admin/login` — Supabase Auth email/password
2. Server-enforced session on `/admin/**` (no operational data before authz)
3. Then `admin_users` allowlist check
4. Then privileged reads via service-role server boundary

Preferred auth: **Supabase Auth** (already aligned with approved `@supabase/supabase-js`).

For **Next.js App Router**, the official Supabase session pattern stores the Auth session in **HTTP cookies** and refreshes tokens in **middleware / proxy** so Server Components and Route Handlers can verify the user on every request.

That cookie/session bridge is provided by the official package **`@supabase/ssr`** (`createBrowserClient` / `createServerClient`). It is **not** included in `@supabase/supabase-js`.

---

## WHY `@supabase/supabase-js` ALONE IS INSUFFICIENT (WITHOUT FRAGILITY)

| Approach with only `@supabase/supabase-js` | Problem |
| --- | --- |
| Browser `localStorage` session only | Server Components / middleware cannot reliably read the session → risk of leaking admin shells or relying on client-only redirects (violates “do not leak operational data before authorization”) |
| Hand-rolled cookie parse/serialize + token refresh | Explicitly forbidden by A5-006: *“Do not invent fragile custom cookie parsing merely to avoid justified official dependency.”* |
| Copy-pasting `@supabase/ssr` internals into the repo | Still a dependency in spirit; harder to maintain; same approval should apply |

Official docs: [Creating a Supabase client for SSR (Next.js)](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs) prescribe `@supabase/ssr`.

---

## OPTIONS

### Option A — Approve `@supabase/ssr` (recommended)

| | |
| --- | --- |
| Package | `@supabase/ssr` (official Supabase) |
| Purpose | Cookie-based Auth session for Next.js App Router (browser + server + middleware refresh) |
| Complements | Existing approved `@supabase/supabase-js` (service-role admin client unchanged; browser still never receives service-role) |
| Alternatives rejected | Clerk, Auth0, NextAuth/Auth.js, Firebase Auth, custom JWT |

**Planned use after approval:**

- Browser client: `createBrowserClient` + anon key for `signInWithPassword` / `signOut`
- Server client: `createServerClient` + anon key + cookies for `getUser` / session
- Middleware: refresh session cookies on `/admin/*`
- Authorization: after verified user → service-role lookup of `admin_users` (`user_id`, `active`) → only then privileged Postgres/Storage reads

### Option B — Client-only auth (not recommended)

Reject for this task: cannot meet server-boundary authorization / no-leak requirements without fragile cookie work.

### Option C — Different IdP (Clerk / Auth0 / NextAuth)

Out of preferred path; requires separate owner approval; larger scope.

---

## SECURITY

| Check | With Option A |
| --- | --- |
| Service-role in browser | **No** — still server-only via existing `getSupabaseAdmin()` |
| Session verification | Server `getUser()` / claims after cookie refresh |
| Admin authorization | Separate `admin_users` allowlist (not email-domain) |
| Operational RLS | Unchanged deny-all; privileged reads only after session + allowlist |
| Public signup | None — login only; bootstrap first admin documented, not invented in migrations |

---

## RECOMMENDATION

**Approve Option A: add `@supabase/ssr` to the approved runtime dependency list for A5-006.**

After approval, resume A5-006 implementation on `feature/a5-006-admin-shell` (migration `admin_users`, `/admin` shell, dashboard, leads, signed photo reads, tests, live non-prod matrix).

---

## OWNER DECISION NEEDED

Reply with one of:

1. **Approve `@supabase/ssr`** — resume A5-006  
2. **Reject** — provide alternate approved session approach  
3. **Defer A5-006** — leave STOP in place  

No package will be installed until you choose (1).
