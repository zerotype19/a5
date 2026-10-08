# Location expansion playbook

Owner clarification, October 8, 2026: A5 is currently a free lead service. Kevin reviews requests, selects vendors and forwards leads. Vendor pre-confirmation and capacity/availability checks are not prerequisites for forwarding or expansion. This version replaces the earlier primary/backup capacity gates; see [ADR-009](../decisions/ADR-009-vendor-routing-architecture.md).

## 1. Define scope

Record the county/municipality IDs, existing services, intended content and operating owner in an expansion brief. Kevin owns incoming requests as they arrive; internal alerts go to hello@a5homeservices.com. Do not invent staffed hours or a guaranteed response time.

Reconcile municipality names to official sources. Preserve legacy IDs, same-name township/borough distinctions and combined Chatham history. Do not infer vendor territory from a business address or equate ZIP codes with municipality boundaries.

## 2. Research and load vendors

Use the [sourcing runbook](VENDOR-SOURCING-RUNBOOK.md). Gather business identity, official public email/phone, advertised services and geography, exact source URLs and review dates. Deduplicate by name, domain, phone and email. Preserve branch distinctions and scope limits. Do not invent email addresses, prices, credentials or review claims.

Use advertised services and service areas to guide manual assignment. These are sufficient sourcing evidence; no advance capacity or onboarding confirmation is required. They do not guarantee that a vendor will accept or perform a particular project.

- Usable email: may receive a manually assigned free lead under the existing workflow, including DISCOVERED records.
- Missing/unusable email: mark INACTIVE and accepting_leads=false. Keep an email-research task until an address is found. Add the address and choose Active when ready to resume.
- Delivery failure: investigate the recorded email error and correct the contact or retry deliberately. Do not treat an uncertain send as permission for repeated bulk sends.
- A vendor who passed a particular lead remains excluded from that lead.

Use exact registry IDs in the existing CSV columns. Import records with email as DISCOVERED; no-email rows are INACTIVE. No activation or confirmation is needed merely to make a sourced record selectable under the existing open-assignment model. Do not bulk rewrite vendor history.

Keep a service/town sourcing matrix with candidate counts, email-present counts, source evidence and missing-contact work. Primary/backup capacity confirmation is not a completion gate for this free-lead phase. Archived matrices that tracked it are historical and must not block work.

## 3. Build useful customer content

Follow county → municipality → service → project/use-case → request navigation. Keep canonical URLs stable. All 226 current municipalities have customer profiles; deepen them with distinct homeowner guidance and primary local sources rather than creating every service/town/problem permutation.

Each indexable page needs a distinct homeowner purpose, differentiated useful content, factual review, sources where needed, explicit canonical/metadata, related-page links and owner-authorized publication. Vendor pre-confirmation is not an SEO gate. Thin directory profiles remain noindex until their editorial case is strong enough; page count alone is not the goal.

Use clear project preparation, photos/details to provide, local official resources, service-specific next steps and contextual requests. Describe A5 accurately: review the request and forward it to a local vendor, who discusses the work, estimate and schedule directly. Do not promise bookings, capacity, emergency dispatch, rankings or guaranteed results. Keep illustrative imagery distinct from actual A5 work. No emojis.

## 4. Verify and release

1. Save a current private baseline and an exact reviewed content/vendor manifest.
2. Validate geographic IDs, duplicates, email state and advertised mappings. Paginate all mapping reads.
3. Verify lead review → manual assignment → email delivery tracking, pass handling and requested follow-ups. Do not require onboarding confirmation. Use only explicitly authorized test recipients; do not send a real lead merely to test a release.
4. Run appropriate tests, lint, typecheck, Next and Cloudflare builds for code changes. Verify mobile 320/390px and desktop layouts, directory search, contextual request links and protected admin access.
5. Release under existing owner authorization with concurrency guards and per-write receipts. Preserve Supabase, existing infrastructure, operating data and history. No new dependencies/schema or service/geo entities without scope authorization.
6. Check live routes, canonicals, robots, sitemap eligibility and internal links. Record actual deployment/verification evidence. Do not equate publication with Google indexing.
7. Update the brief, sourcing matrix, current production summary and release record. Report missing emails, failed deliveries or unresolved source conflicts as specific tasks.

On an uncertain write, inspect the receipt and live row before resuming. Roll back only affected records with concurrency protection; never delete customer or vendor history. Worker rollback does not undo database edits or emails.

## 5. Operate and expand

Use `/admin/queue` for review, assignment, delivery errors, explicitly scheduled follow-ups and missing-email research. Forwarded leads remain recorded; a missing Accept response does not create a pre-confirmation requirement. Preserve actual response/outcome data rather than claiming work was accepted or completed.

Review delivered leads, qualified requests, vendor passes, outcomes and search/conversion evidence. Continue content and public-source vendor expansion while Kevin handles incoming requests. Ads, spending, mass outreach and automatic routing remain outside this playbook unless separately authorized.
