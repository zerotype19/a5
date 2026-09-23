# A5 Home Services — Development Governance

This document is authoritative for repository contributors and AI coding agents.

The full product and architecture context lives in the owner-controlled project context. This file restates the operating rules that bind implementation work in this repository.

## Authority hierarchy

```text
OWNER
 ↓
MASTER BUILD SPEC / PROJECT CONTEXT
 ↓
CURRENT PHASE
 ↓
APPROVED TASK
 ↓
CURSOR / CODEX (implementation)
 ↓
TEST
 ↓
OWNER ACCEPTANCE
 ↓
MERGE / RELEASE
```

Nothing skips a layer.

## Roles

- **OWNER** — product manager and final decision-maker.
- **Cursor / Codex** — implementation engineers. They implement approved specifications; they are not the product owner or system architect.

## What agents MAY do

- Implement approved tasks only
- Write tests
- Fix bugs necessary to complete approved tasks
- Improve accessibility required by specification
- Document implementation
- Identify architectural concerns
- Recommend future improvements (without implementing them)
- Create branches and pull requests for review

## What agents MUST NOT do

- Expand scope or add unapproved features
- Change architecture without an approved ADR update
- Add SaaS products, SDKs, or npm packages without owner approval
- Redesign UI outside specification
- Change database schema outside an approved task / migration
- Refactor unrelated code
- Create new services or locations beyond the approved registries
- Publish content
- Change tracking definitions, routing logic, SEO strategy, or vendor economics
- Deploy production, modify production data, change DNS, or spend money
- Change Google Business Profile
- Send marketing communications
- Activate vendors
- Implement their own recommendations without approval

## When uncertain

**STOP.** Do not interpret ambiguity as permission.

Return:

```text
ISSUE
WHY IT MATTERS
AVAILABLE OPTIONS
RECOMMENDED OPTION
FILES / SYSTEMS AFFECTED
OWNER APPROVAL REQUIRED
```

Wait for owner instruction.

## Git control

- `main` represents deployable production code.
- Agents do not develop directly on `main`.
- Pattern: `feature/<task-name>` → PR → owner acceptance → merge.
- One approved task → one reviewable PR wherever practical.

## Definition of done

A task is done only when:

- Approved scope is satisfied
- Tests, typecheck, lint, and build pass
- No unauthorized dependencies or schema drift
- No secrets committed
- Documentation updated as required
- Owner accepts

**Done does not mean deployed.**

## Production control

Production remains owner-controlled. Agents may inspect, plan, code, test, build, document, branch, PR, and recommend. They may not autonomously deploy production or change production infrastructure/data.

## Secrets

Secret **names** are documented in `/docs/SECRETS.md`. Actual values belong only in environment configuration. Never commit credentials.

## Architecture decisions

Locked decisions live in `/docs/decisions/` (ADR-001 through ADR-010). An approved ADR may not be silently reversed. If implementation conflicts with an ADR: **STOP** and request an architectural decision.

## Product registries

Approved services, locations, and site identity are defined only in:

- `/config/services.ts`
- `/config/locations.ts`
- `/config/site.ts`

Application code must consume these registries. The existence of a technical capability does not authorize adding an entity.

## Feature flags

Meaningfully new capabilities must be capable of remaining disabled via environment flags (see `/docs/SECRETS.md` and `.env.example`). Code existing does not mean functionality is active.

## Database changes

All database changes require migrations under `/supabase/migrations/`. No destructive production migration without explicit owner approval.

## Dependency policy

No npm package, SDK, external API, SaaS product, database, framework, or infrastructure service may be introduced unless already approved in project context §10 or explicitly approved by the owner. Prefer fewer dependencies and native platform capabilities.
