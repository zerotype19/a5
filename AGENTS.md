# A5 Home Services — agent instructions

Before any substantive work:

1. Read `GOVERNANCE.md`
2. Read relevant ADRs under `docs/decisions/`
3. Read the assigned task contract
4. Inspect existing implementation
5. Identify conflicts or ambiguity — if present, **STOP** and report; do not code around them

Implement only the approved task. Prefer fewer dependencies. Do not deploy production.

After implementation: run tests, typecheck, lint, and build; summarize files changed, migrations, dependencies, risks, and whether anything outside scope changed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
