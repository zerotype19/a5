# Location expansion playbook

Use this playbook whenever A5 adds a county, municipality, neighborhood, service-area boundary or an existing service in a new geography. Owner-requested October 7, 2026. This is an operating procedure and release checklist, not a change to application assignment rules.

**An expansion is complete only when homeowners can find us, submit a request, and be served through an evidenced vendor and follow-up process. Published pages alone do not establish fulfillment readiness.**

Start each expansion by copying [the expansion brief](EXPANSION-BRIEF-TEMPLATE.md) and creating a service-by-municipality coverage matrix. For the current regional expansion, use [the North Jersey readiness audit](NORTH-JERSEY-READINESS.md) and [its coverage matrix](NORTH-JERSEY-COVERAGE-MATRIX.csv).

## 1. Define scope and ownership

Record the approved county/municipality IDs, services, exclusions, launch mode, target date and existing authorization. Name one accountable expansion owner and the people responsible for vendor readiness, editorial review, release and daily lead follow-up. An alert mailbox is not a named operating owner.

Use official county/municipal sources to distinguish municipalities from mailing names, neighborhoods and ZIP codes. Check same-name towns, borough/township pairs and county boundaries. Preserve existing operational IDs and URLs; explicitly document aliases or historical combined areas. Do not infer a vendor's travel territory from its business address or a homeowner's municipality from a shared ZIP code.

Choose one release state:

| State | Meaning | Permitted claim |
| --- | --- | --- |
| Proposed | Scope and evidence gathering | Internal planning only |
| Directory published; fulfillment incomplete | Useful reviewed content and request path are live; supply is unconfirmed | Requests accepted for individual availability review |
| Fulfillment ready for listed service/town pairs | Named providers, current capacity and handoff evidence meet the checks below | Confirmed operational coverage limited to those pairs |
| Expansion complete | Every pair in the approved fulfillment scope passes, and content/operations/measurement evidence is recorded | Completion of that exact scope |

Do not promote a county to fully covered because one town or one trade is ready. Partial readiness must name the service/town pairs that passed. Paid acquisition needs its own approved budget and a ready fulfillment scope; directory publication does not enable it.

## 2. Audit existing supply before creating more demand

Read live vendor, service and location mappings, not only an old import CSV. Count business vendors separately from test records and duplicates. For each intended service/town pair, record candidate count, usable contact details, evidence age, primary/backup status and the next action.

Keep these three concepts separate:

- **Selectable:** the operator can choose the vendor in admin. Current open assignment permits manual selection regardless of status/service/geography; a vendor who passed that lead is excluded.
- **Contactable through the product:** the selected vendor has a valid email and the assignment notification can be delivered. A saved assignment can exist even if its email fails. A phone number does not make the email Accept/Pass flow work.
- **Fulfillment ready:** the vendor has confirmed the exact work, geography and current availability, with a responsible operator and working handoff.

The current implementation is documented in [ADR-009](../decisions/ADR-009-vendor-routing-architecture.md), [assignment eligibility](../../src/lib/admin/eligibility.ts), [notification policy](../../src/lib/opportunity/policy.ts) and [vendor actions](../../src/lib/admin/vendor-actions.ts). Do not silently replace open assignment with automated routing or new eligibility gates.

Service and town mappings are stored separately. Their intersection identifies a candidate, not proof that the vendor offers every listed trade in every listed town. Confirm each launched combination or an explicit vendor statement covering the full named set.

## 3. Source, confirm and load vendors

Work existing relationships first: request explicit service-area extensions and current capacity, then fill gaps with new businesses. A publicly advertised service area can support a candidate record but does not establish willingness to receive A5 leads.

For each candidate, gather:

| Field | Evidence needed |
| --- | --- |
| Identity | Business name, official website/source URL, duplicate check against existing records |
| Contact | Business phone, business email, contact role, source and review date |
| Work | Specific services accepted, exclusions and project limitations |
| Geography | Named municipalities or an explicit territory statement that can be reconciled to the registry |
| Capacity | Current willingness to receive A5 requests, availability constraints and confirmation date |
| Credentials | Applicable credential/insurance information and verification evidence; unknown remains unknown |
| Handoff | Intended email recipient and agreed response/escalation process |

Use the existing CSV import columns: `business_name, contact_name, phone, email, website, services, locations, source, source_url, discovery_notes`. Registry IDs must resolve. Review duplicates before import; update an existing business instead of creating a second row for another county. New imports enter DISCOVERED with accepting leads disabled. Status changes follow the owner-authorized operating process; importing a spreadsheet must not automatically certify or activate a vendor.

Record confirmation source/date and any limits in the existing notes; keep private contact conversations and credentials in the approved private record, not public content or committed documentation. Use references in the expansion matrix. Do not create a new CRM or schema as a side effect of geographic expansion.

Outreach, vendor activation, live test messages and spending must be within explicit authorization. Reuse authorization already given for the same action; do not ask again solely because this checklist mentions a gate. Public research and preparation can continue without pretending an unreceived vendor confirmation exists.

### Fulfillment gate for each service/town pair

- A named primary vendor has confirmed the service, municipality and current capacity.
- Identity, contact route, relevant scope limits and credential review are recorded with dates.
- The intended recipient has a working notification route; delivery is distinguished from acceptance.
- A fallback is documented: preferably a confirmed backup vendor; otherwise an owner-accepted manual sourcing and homeowner-update plan. Flag single-provider dependency explicitly.
- A named operator owns unaccepted requests, provider passes, missed responses and homeowner updates. Response targets and staffed hours are recorded rather than invented by software.
- No test vendor is counted as capacity. ACTIVE/accepting flags alone are not evidence.

Planning target: primary plus backup for every launched pair. If the owner accepts a single-provider launch, record the scope, contingency and review date as an explicit exception; do not hide it in an aggregate county count.

## 4. Prepare geography and admin operations

- Add approved entries to `config/locations.ts` / `config/municipalities.ts` and county metadata to `config/counties.ts`; keep `config/services.ts` unchanged unless service expansion is explicitly included.
- Add an idempotent location seed under `supabase/migrations/`. Rehearse it twice in a disposable transaction and verify both additions and unchanged legacy IDs.
- Preserve historic data. A combined Chatham mapping is not automatically two confirmed municipality mappings.
- Review lead classification, vendor search/filter, county grouping, table readability and the effect of unknown/unclassified ZIP codes.
- Verify filtered-out vendor selections survive edits. Never bulk-select an entire county based on one address or a broad public directory listing.
- Load only supported vendor mappings; record unverified reach as a candidate note, not confirmed operating coverage.
- Confirm the alert mailbox and name the daily follow-up owner. Check assignment, notification-failure, acceptance/pass, expiry and outcome handling.

## 5. Build useful content and discovery paths

Prepare an explicit editorial manifest: page type, intent, location/service IDs, canonical path, direct question/answer, source references, related pages, reviewer and proposed publication date.

Use the established county → municipality directory / authored town guide → service → repair/use-case → request path. Existing town and service URLs stay stable. County pages use the current allowlisted CORE implementation; changing that architecture requires a separately scoped decision.

Each indexable page must have materially useful content for its intent. Do not generate every town × service × problem combination. A directory entry can exist without its own article. Use official sources for geography and local factual claims; do not invent local housing characteristics, pricing, permits, projects, ratings, credentials or branch addresses.

Content requirements:

- A direct answer and clear next step, with accurate availability language.
- Specific project preparation, scope questions or decision guidance beyond swapping a town name.
- Internal links to relevant published services, problems, guides and nearby geography where useful.
- Appropriate imagery/alt text using approved assets; distinguish illustrative imagery from real A5 work.
- Consistent header, footer, typography, spacing and CTAs; SVG icons are allowed, emojis are not.
- Canonical, title/description, breadcrumbs, suitable schema and published/indexable controls. Do not represent a directory as a local office or verified vendor network in every town.
- Contextual request links that preserve the correct town/county/service; no private details in analytics or public URLs.

Validate against [ADR-008](../decisions/ADR-008-url-architecture.md), [ADR-010](../decisions/ADR-010-content-architecture.md), [authority engine documentation](../AUTHORITY_ENGINE.md) and [the content templates](../foundation/CONTENT-TEMPLATES.md).

## 6. Verify the complete journey

Record evidence and failures, not only a checked box.

| Check | Required result |
| --- | --- |
| Inventory | Municipality names/counts match sources; duplicates/aliases and registry IDs reviewed |
| Coverage | Every fulfillment-launch pair has primary/fallback evidence or a named exception |
| Content | Factual/editorial review passes; no thin permutations or unsupported capacity claims |
| Links/indexing | Canonicals, crawlable links, sitemap eligibility, robots, schema and unknown-route 404s pass |
| Mobile | Directory, county/town page, request form, header/footer and admin selectors work at 320/390px and desktop |
| Search | County/town names, same-name municipalities and empty results behave clearly |
| Admin | Lead location classification and coverage filtering retain correct IDs and selections |
| Intake | Real authorized rehearsal verifies CAPTCHA, saved lead, optional private photo handling, attribution and owner alert |
| Handoff | Authorized test with an intended recipient verifies assignment, delivery, Accept/Pass, reassignment and expiry handling |
| Outcomes | Operator can track homeowner contact, estimate/work outcome and closure; no false accepted/completed records |
| Build | Appropriate tests, lint, typecheck, Next build, vinext build and CI pass for code changes |

Never infer inbox receipt from a send API response, vendor acceptance from delivery, or verified coverage from an ACTIVE flag. Use approved test data and recipients; do not send real customer details to an unconfirmed provider. Keep test fixtures identifiable and out of readiness totals. Obtain any required CAPTCHA interaction confirmation at the time of the test.

For document-only changes, check links and artifact consistency; do not invent a need to rebuild or redeploy the site. Existing automated CI may still run.

## 7. Release in a controlled sequence

1. Reconcile the current database/code baseline and record existing owner authorization for the exact scope.
2. Decide whether this is a directory-only publication or a fulfillment-ready launch. Record failed gates and exceptions before using a completion label.
3. Freeze the content manifest; save baseline/rollback evidence. Keep production keys out of logs and committed files.
4. Merge reviewed code after required checks. Apply the reviewed geography seed without rewriting legacy rows. Record whether SQL migration history or an equivalent REST seed was used.
5. Stage content as drafts; attach evidence/relationships; publish the authorized records with concurrency guards and receipts. Record actual publication timestamps.
6. Deploy the verified build to Cloudflare, retaining Supabase and existing runtime bindings. Document Worker version and commit.
7. Check live pages, sitemap, contextual requests, mobile behavior and private admin access. Existing sitemap submission covers new entries; check Search Console processing when available rather than claiming immediate indexing.
8. Update the brief, readiness matrix, repository production summary and release record. List remaining fulfillment work separately from deployed content.

Publication may be interrupted between tables/records. Inspect the receipt before resuming. For content withdrawal, conditionally return the affected pages to draft/nonindexable without overwriting newer changes. Keep location/source rows that may be referenced. Never delete leads, vendor history or customer photos as a release rollback shortcut. A build rollback does not undo a sent message or a database publication.

## 8. Operate and measure

During staffed hours, the named operator checks new/unassigned requests, overdue contact, failed notifications and provider passes. Escalate coverage gaps and update the homeowner using the agreed response process. Do not keep promoting a service/town pair whose capacity has lapsed.

At the first operating review and weekly thereafter, review provider capacity, notification delivery, acceptance/pass, qualified requests, estimates and outcomes by geography/service. Review Search Console indexing/query relevance and consented GA4 behavior separately from fulfillment. These are operating review instructions, not a newly scheduled automation.

Refresh public coverage claims and the matrix when evidence changes. Further content or geographic expansion should use demand and fulfillment evidence from the current cohort. Paid campaigns remain deferred until separately authorized.

## Completion packet

An expansion closes with a scope brief, municipality sources, service/town readiness matrix, vendor confirmation references, editorial manifest, test evidence, release/rollback record, named operating owner, monitoring targets and unresolved exceptions. Link this packet from `docs/README.md` and update the root production summary. If supply is unfinished, the status remains **directory published; fulfillment incomplete** even when every website check passes.
