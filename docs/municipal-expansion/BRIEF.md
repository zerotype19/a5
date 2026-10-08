# Full Northern New Jersey municipality expansion

Owner request October 7, 2026: run the expansion playbook, build customer-facing geography pages, capture vendors and enter them into the system. Continuing existing publication/deployment authorization. Scope: all 226 municipalities in the eight existing counties and the eight existing services; preserve the historical combined Chatham page and operational ID.

Status: Supabase publication/import completed October 8, 2026 UTC; application release verification in progress. Fulfillment remains unconfirmed. See OPERATING-GUIDE.md and RELEASE.md.

## Delivery

- One published customer-facing LOCATION record per municipality, preserving the nine existing authored hubs (including legacy Chatham). New directory profiles are noindex/follow until distinct local editorial/demand evidence supports indexing. No town × service × problem permutations.
- County/town navigation, service-specific contextual requests, county identity and source references, useful project preparation, consistent mobile layout and imagery.
- Review existing vendor contacts first; source missing county/service candidates from business-owned public pages, retain evidence, deduplicate by name/domain/phone/email, import using the existing CSV parser and vendor-save RPC. New records remain DISCOVERED and accepting_leads=false. No outreach, activation, paid tooling or verified-capacity claims.
- Record actual vendor/town/service gaps, failed sources and missing emails. Candidate mappings describe advertised reach, never A5 acceptance.

## Ownership and limits

Kevin McGovern is the requesting owner. Codex handles implementation, source review and release evidence. Kevin will handle daily vendor confirmation and lead follow-up as requests arrive, using the same alert mailbox. No fixed staffed hours or response-time promise. Owner also requested a work queue for requests, assignments and vendor tasks; add a read-only prioritized queue linking to existing actions. Alert mailbox: hello@a5homeservices.com. No new outreach authorization has been given. Confirmation, credentials and live vendor handoffs remain required before any fulfillment-complete claim.

## Gates and recovery

Exact content/vendor manifests, ignored baseline backup and per-write receipts. Preserve existing rows; fill missing emails only with reviewed public evidence and concurrency guards. No migrations or schema changes anticipated. Publish approved profile records only; noindex records stay out of the sitemap. Verify all town routes, canonical/robots/context links, mobile layout, admin import and mappings, tests/builds/CI. Recover by conditionally withdrawing this batch's content or marking imported candidates as withdrawn; never delete operational history or overwrite later edits.
