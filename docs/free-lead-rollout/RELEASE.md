# Free lead forwarding and first local-depth content batch

Owner authorized October 8, 2026: no vendor capacity/availability or pre-confirmation requirement; vendors missing email are inactive until an address is found. Continuing existing expansion/release authorization.

## Applied records

25 no-email vendors are now INACTIVE with accepting_leads=false. Their other fields, service/location mappings and assignment history were preserved. 83 business records remain, plus the existing test fixture. 58 business records have a usable-format email; 25 need email research. The new sourcing matrix covers all 1,808 service/town pairs with at least two public-email prospects per pair. This describes sourcing for manual forwarding, not guaranteed contractor service or inbox delivery.

218 municipality profiles now describe request review and forwarding, without implying a prior capacity check. Eight were substantively expanded and made indexable: Ridgewood, Montclair, Jersey City, Parsippany-Troy Hills, Wayne, Sparta, Westfield and Phillipsburg. They contain different local project-planning guidance, 14 official municipal references and relevant service links. 210 shared directory profiles remain noindex for editorial reasons only. No new pages or geography/service entities were generated. Published records remain 288; intended sitemap count is 83.

## Application behavior

- Vendor queue contains missing/invalid email research, not onboarding or capacity confirmation. It includes inactive vendors whose email is missing.
- Saves and CSV imports without usable email set INACTIVE and accepting_leads=false. After adding an address, the operator can select Active. Imports with email remain DISCOVERED, which is not a forwarding gate.
- Admin assignment choices require an email. The server action also checks it before creating an assignment. All other open-assignment rules, service/area discretion, pass exclusion and recorded response/outcome behavior remain intact.
- Forwarded leads are labeled accordingly. Expired response links remain visible but do not manufacture a capacity-confirmation task. Explicitly scheduled follow-ups and actual delivery errors retain priority.
- Public directory, service browsing, intake guidance and footer explain forwarding and direct vendor discussion. No messages or leads were sent as part of this release.

## Evidence

257 tests, lint, TypeScript, Next and Cloudflare builds passed before release. Browser checked local content at 390px and a long town heading at 320px, without horizontal overflow. Source claims were reviewed against business-independent official municipal pages; local requirements are referred to the responsible office, not decided by A5.

Read-only database audit confirmed 25 inactive no-email records, 25 email-research tasks, 45 open request tasks, 59 email-present selectable records including the existing test fixture, 288 published pages, eight newly indexable guides and 14 attached new sources. Non-target vendor/content fields and original publication history were preserved.

Exact reviewed manifest: CONTENT-MANIFEST.json. Editorial text/source ledger: ../../content/local-depth/towns.json. Private before snapshots, concurrency-protected write receipts and live verification output: ignored .wrangler/free-lead-rollout/. No dependencies, schemas, migrations, billing or automatic routing added. PR/deployment and final live route results are recorded with the release PR after deployment.

## Recovery and remaining work

Pause on an uncertain write and inspect the receipt. Restore only this batch's changed fields with current timestamp guards, preserving newer owner edits and all assignment history. Never rerun the whole publication blindly. A Worker rollback does not revert database state.

Continue distinct local content for the remaining profiles, search/indexing measurement and email research. Neither capacity confirmation nor recipient pre-confirmation blocks that work. Real project/team evidence and paid acquisition remain separately scoped.
