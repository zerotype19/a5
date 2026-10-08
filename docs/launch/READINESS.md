# A5 launch package — October 7, 2026

Status: owner accepted and explicitly requested production deployment on October 7, 2026. See RELEASE-2026-10-07.md for release evidence; the initial preparation and remaining business-readiness checklist below are retained for context.

Current October 8 content, database and vendor-depth status: [release evidence](../growth-wave-3/RELEASE.md). The owner-approved free-lead model does not require capacity or pre-confirmation; the older readiness gates below are historical.

## Historical October 7 reconciliation

The launch migration and public release below are complete; subsequent foundation and authority releases are live at main `62b1826c5503198cf950cfbddc690bf8df8dd3e4`. ENABLE_LAUNCH_PIPELINE is true. The original preparation notes are historical. The current checklist is [PLAN-COMPLETION-AUDIT-2026-10-07.md](PLAN-COMPLETION-AUDIT-2026-10-07.md). The owner supplied the internal recipient and GA4 ID; delivery, account settings and production activation are not yet verified. The operations branch prepares a gated five-minute Cloudflare scheduler using existing secrets. Pilot and expansion decisions are deferred.

## Historical source reconciliation

The original attached repository `/Users/kevinmcgovern/a5` is an older `feature/a5-d001-problem-first` checkout at `695dbd9` with uncommitted work. The newer `main` worktree `/Users/kevinmcgovern/a5-worktrees/d001` is at `b01e95d` and contains additional uncommitted public-site and operations changes matching observed live copy. A fresh origin fetch found no newer main commit.

This package is in `/Users/kevinmcgovern/a5-worktrees/launch`, branch `feature/a5-launch-readiness`, based on `origin/main` plus a non-destructive copy of that newer worktree's tracked and untracked changes. Neither source worktree was changed. These inherited changes include authority links/content rendering, relaxed vendor assignment eligibility, the `20260930180000_open_vendor_assignment.sql` migration and associated tests. They are not new launch recommendations. Review them separately before merge. Deployed artifact provenance has not been independently matched to a build identifier; confirm the release baseline with the owner.

Correction to the preliminary audit: current main already has first-landing-page capture and vendor email Accept/Pass. The launch work extends these with campaign attribution and an operations alert outbox rather than replacing them.

## Implemented

- Warm cream/teal homepage, nine original illustrative images, service cards, retained problem links, local coverage and clearer process/FAQs.
- A reusable commercial landing layout for all eight approved service hubs and existing service/location pages. Published database content, sources and relationships remain the content authority; no draft content is made public and no service/town matrix is created.
- Contextual request links, validated service/town/problem parameters, three visible form stages with existing validation, optional photo recovery and submission idempotency preserved.
- About page and substantive terms draft, explicit coordination model and emergency limitations; owner/legal review before release.
- Request-page canonical + noindex, sitemap alignment, clean titles, per-service share images, mobile contact bar and skip link.
- Optional consent-gated GA4 using the existing approved measurement-ID setting. No analytics tag without a configured ID and affirmative choice.
- Session first/last acquisition with sanitized paths, referrer host and bounded allowlisted campaign values. No form text/PII is sent to GA4. Campaign URL authors must never put personal information in UTM values.
- Feature-gated atomic acquisition persistence and operations notification outbox; private acquisition summary in Operations.
- Explicitly enabled operations email worker with provider idempotency. It sends only the reference and authenticated admin URL, not homeowner contact information.
- Campaign drafts, evidence brief, measurement definitions and operating checklist in this directory.

## Decisions and evidence still needed

| Gate | Owner input / evidence | Current state |
| --- | --- | --- |
| Business model | Confirm A5 coordinates introductions and providers contract directly; revise copy/terms if different | Assumed from existing live site; unconfirmed |
| Service supply | For each marketed service/town: active accepting provider, scope, credentials, backup and capacity | Not verified; no vendors activated |
| Response promise | Named lead owner, actual staffed hours, feasible first-response target and escalation owner | Not supplied; no invented public deadline |
| Social proof | Permissioned real project photos, accurate attribution, actual customer reviews and named team bio | Not supplied; illustrative assets are labeled |
| Terms/privacy | Confirm business role, provider relationship, analytics and data practices | Draft prepared; review pending |
| Analytics | Real GA4 ID, stream settings, consent/event test and Search Console access | ID supplied; stream settings and activation verification pending |
| Email delivery | Verified sender, operations recipient, secrets, supervised test, scheduler ownership and alert monitoring | Code ready; disabled and unsent |
| Production data | Apply reviewed additive migration and prove production-role permissions/idempotency | Launch migration applied; outcome migration prepared and locally tested |
| Pilot economics | Approved monthly cap, capacity and A5 contribution per won project | Not supplied; ads remain drafts |
| Release | Confirm baseline, accept design and staging checks, owner deploy | Launch, foundation and authority releases deployed; new operations slice not released |

## Release sequence

1. Review inherited baseline changes separately. Preserve the original uncommitted work. Review this branch and capture a release commit before deployment.
2. Confirm the operating model and provider coverage; review the terms/privacy draft. Use the evidence brief to replace illustrative visuals with actual approved work over time.
3. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, then `npm run build:vinext` sequentially. Next and vinext can both write generated type artifacts; avoid concurrent builds. If generated route types conflict, clear only the local generated `.next` directory and rerun the Next build. No hosting dependencies were added or upgraded.
4. On a disposable/staging database, apply the existing baseline migrations and `20261007170000_a5_launch_attribution_outbox.sql`. `node scripts/test-launch-migration.mjs` separately tests the new migration against an isolated local PostgreSQL instance with a stub of the existing submission RPC; it does not replace full-stack staging verification.
5. Verify an authorized test lead including duplicate retry, bot rejection, photo failure/retry, acquisition row, outbox row, admin-only access and vendor handoff. The local preview has only public read credentials and intentionally cannot create production leads.
6. After migration succeeds, enable `ENABLE_LAUNCH_PIPELINE=true`. It switches the server to the additive wrapper RPC. Keep `ENABLE_OPERATIONS_ALERTS=false` until delivery is tested. Existing submission behavior is retained when the pipeline flag is false.
7. Configure GA4 only after disabling Enhanced Measurement automatic page/history changes, form interactions and other automatic events. This implementation sends a controlled set of manual events and strips query/referrer paths. Disable unwanted data collection at the GA4 stream, then test accepted/declined/revoked choices in the network inspector. Never send contact details, project descriptions or photos. See Google's [manual pageview guidance](https://developers.google.com/analytics/devguides/collection/ga4/views).
8. Configure `OPERATIONS_ALERT_EMAIL`, approved Resend sender/domain and runtime secrets. The explicitly enabled worker command is `node --env-file=.env.local scripts/process-lead-notifications.mjs --send`. Schedule it using an owner-managed environment with secrets, never a browser or public endpoint. The later operations slice prepares a five-minute Cloudflare cron, gated by ENABLE_OPERATIONS_ALERTS; it remains inactive until release and configuration checks.
9. Verify browser, mobile and accessible keyboard journeys in staging, all eight service pages, safe 404s, site-map contents, canonical host redirects, robots and social previews. Validate schema using Rich Results Test, and crawl/index access using Search Console. Obtain real mobile field performance after release; a development screenshot is not a Core Web Vitals result.
10. Owner performs the production migration/release. Public build variables must be correct at vinext build time. Turnstile remains required in production. Re-run a supervised production smoke test before enabling ads.

## Operations alerts and recovery

Check Operations and the outbox during staffed hours even if email delivery appears healthy. A saved lead must receive an owner; an email is not fulfillment.

`PENDING` jobs await the worker. `SENDING` jobs have been claimed; old locks indicate a worker crash. `FAILED` jobs require investigation. Workers do not silently requeue uncertain sends. Consult Resend before requeueing, keep the same payload/key and confirm whether the message was delivered. Resend retains idempotency keys for 24 hours; after that, re-sending can duplicate an already-delivered email. See [Resend idempotency](https://resend.com/changelog/idempotency-keys). Requeue deliberately only after that review. Email failures do not delete the lead. Stop paid acquisition if requests cannot be handled promptly.

Rollback: disable `ENABLE_LAUNCH_PIPELINE` to restore the previous submission RPC and disable the email worker/analytics config. Retain additive tables for records; do not drop production data as a rollback shortcut. Revert the reviewed code release if necessary. New campaigns remain paused until the funnel is reconfirmed.

## Daily/weekly operating rhythm

Daily: review new/unassigned requests, contact overdue homeowners, confirm provider acceptance, inspect unsent alerts, record outcomes and exclude spam/duplicates. Use the existing qualification and assignment tools; do not automate vendor selection.

Weekly: reconcile spend, qualified leads, contacted/estimated/won jobs and A5 income by service and source. Review query relevance and provider capacity; improve the most important point of abandonment. Invite genuine feedback consistently and obtain explicit permission for project stories. Do not gate reviews or invent review totals.

## Scope remaining beyond this package

Real customer evidence, owner bio, verified credentials, response SLA, external account configuration, staging/production end-to-end delivery, Google crawler/index verification, actual advertising, private revenue data integration and ongoing optimization require the listed inputs and release steps. This package does not claim those outcomes have occurred. It also does not promise rankings, AI citations or a lead volume.

## Verification recorded October 7

- 221 automated tests passed; ESLint, TypeScript and production Next build passed. Cloudflare-targeted vinext build also passed. No dependency additions.
- Isolated PostgreSQL migration test passed atomic rollback, repeat-apply, duplicate submission, immutable first acquisition, single queue claim and restricted RPC access. It uses a stub baseline RPC and does not constitute production end-to-end proof.
- Browser verified masonry landing content and service-prefilled request flow through all three stages to review. No lead was submitted and no email was sent.
- Homepage visually inspected at a confirmed 390px browser viewport with no horizontal overflow. This is responsive layout verification, not device lab or Core Web Vitals evidence.
- Image-generation mode, exact prompts, original paths and optimized asset locations are recorded in `image-sources.json`.
