# Customer-first town copy correction

This release supersedes the municipal-procedure-led copy from the town-profile rollout. Its purpose is to help homeowners recognize a job, understand A5’s connection role and submit a useful request. It does not expand the geographic or indexable footprint.

## Editorial scope

- 221 introductions and sets of three project examples rewritten individually in `content/customer-copy/edits.tsv`.
- Six earlier customer-focused pages retain their problem navigation, with consistent network/CTA wording, removal of the obsolete eight-service list and correction of unsupported project-volume or coordination claims.
- 34 concise local notes retained where they help a customer make a decision or distinguish similarly named municipalities. Existing source records remain attached for provenance; source lists appear only with the relevant retained advice.
- All 227 location pages expose the same complete 16-service selector, with descriptions for the eight previously blank expansion categories. Customer context and an early request CTA precede that selector.
- Existing IDs, slugs, H1s, titles, indexability, content relationships and source associations remain unchanged. Lead handling and vendor data are outside this change.

Shared workflow wording is intentionally consistent. Project examples are editorial starting points, not assertions about local housing stock or service demand. No reviews, credentials, availability, prices or completed projects have been invented.

## Review and verification

The owner-authorized Brand positioning ideas conversation reviews six sequential sets of actual drafts (40/40/40/40/40/27). Apply its concrete corrections and bind the final manifest digest to `review.json`. Local/public render checks, database reconciliation, standard tests/lint/typecheck and both builds precede final verification. The development-only preview route must be removed before builds.

Artifacts:

- `manifest-digest.json`: exact prepared public copy.
- `draft-audit.json`: allowed-field and content-scope checks.
- `preview-verification.json`: all-page local render verification.
- `review.json`: final editorial approval and digest.
- `database-live.json`: post-release field and untouched-data reconciliation.
- `live-verification.json`: canonical production copy, metadata, sitemap, service CTA and anchor checks.

Private production before/after snapshots and write-ahead receipts remain under ignored `.wrangler/customer-copy/`. Release uses batches of ten, optimistic timestamp guards and response verification. A partial or uncertain receipt must be reconciled before resuming; do not rerun blindly. To undo a content update, prepare an explicit reviewed inverse manifest from the private before-image and current timestamps. Runtime rollback uses the prior recorded Cloudflare Worker version. No database schema or dependency change is involved.

Historical `docs/town-profiles` evidence describes the preceding release. Its copy digests are not evidence of this revision.

## Search expectations

The copy pass improves customer usefulness; it does not establish Google indexing, ranking or spam-policy approval. No robots, canonical, sitemap eligibility or URL changes are part of this release. Search Console observations and genuine customer response should guide later improvements. Google’s [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) are the relevant standards; page count or AI authorship alone does not demonstrate compliance.

## Released October 9, 2026

Merged [PR 73](https://github.com/zerotype19/a5/pull/73), commit `1ccf42d`, and deployed Worker `d7ff7900-3fe4-4838-b69e-436473757a3d`. All 227 production town pages match the reviewed copy. The full crawl checked 319 URLs with zero errors, including all 318 sitemap entries; 18 browser/Googlebot metadata comparisons passed. Database reconciliation confirms source associations, relationships and all vendor tables are unchanged. Narrow mobile previews passed at 390px and 320px, and the Belvidere HVAC CTA correctly prefilled the live request form without submitting a lead. See `COMPLETION.json` for the release record. No new Search Console indexing measurement is claimed.
