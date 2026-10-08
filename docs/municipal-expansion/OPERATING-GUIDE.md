# Municipal expansion and daily queue

Kevin owns requests and vendor follow-up as they arrive. Alerts continue to hello@a5homeservices.com. Open `/admin/queue` from the Operations navigation or overview.

1. Resolve delivery failures and expired vendor response links first. Inspect the latest attempt before retrying a pending email.
2. Review new requests, qualify the scope and assign the appropriate provider. Existing lead detail actions remain the source of truth.
3. Confirm homeowner contact, progress estimates and record outcomes. Set a follow-up date when another check is needed. Closed requests leave the queue automatically.
4. Use the Vendor tasks tab to confirm new prospects and missing/public-source email recipients. Imported businesses remain DISCOVERED, not accepting leads. Confirm service scope, exact territory, availability, recipient and applicable credentials before a customer handoff.
5. For enriched existing contacts, replace `Contact confirmation pending.` in discovery notes with a dated confirmation once checked. The email task then leaves the queue. Existing vendor operating statuses were preserved, not re-certified.

## What this batch means

218 new municipality directory profiles plus eight existing exact municipality pages cover the 226-municipality registry. The historical combined Chatham guide remains. Each new profile provides eight service request paths, county context, project preparation, FAQs, imagery and official county references. These shared directory profiles are published noindex/follow and excluded from the sitemap until distinct local editorial/demand evidence supports indexing. This is customer navigation coverage, not completion of indexable SEO content for every municipality.

23 new candidate records provide at least two public-source prospects with an email for every one of the 1,808 service/municipality combinations. These are advertised regional territories, not two independently confirmed local providers in every town. Narrow scope restrictions remain in discovery notes. The matrix intentionally records zero confirmed primary/backup pairs; confirm and record evidence before changing that assessment. No outreach or new vendor activation is included.

## Evidence

- `CONTENT-MANIFEST.json`: exact new page IDs, paths, noindex policy and payload hash.
- `VENDOR-CANDIDATES.json`: public source URLs, advertised territory and scope caveats.
- `VENDOR-IMPORT.csv` / `VENDOR-MANIFEST.json`: reviewed parser-compatible batch and hash.
- `CONTACT-ENRICHMENT.json`: 17 existing blank email fields and source/conflict notes.
- `COVERAGE-MATRIX.csv`: 1,808 service/town rows, named candidates, confirmation owner and pending actions.
- Private ignored `.wrangler/municipal-expansion/`: before snapshot, per-write receipts and verification output. Contains operational business data; do not publish wholesale.

## Recovery

Stop on any uncertain write. Inspect the receipt's pending intent and live row before resuming; never rerun the whole import blindly. Withdraw only this batch's pages after checking their current update timestamps and later edits. Retain source relationships and vendor audit history. Imported candidates can be paused/withdrawn through existing admin controls; preserve records. Revert an enriched email only if it still matches this batch and has not subsequently been edited or confirmed. Worker rollback alone does not withdraw database content.
