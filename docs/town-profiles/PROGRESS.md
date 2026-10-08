# Town profile publication progress

Initial scope: 202 existing published/noindex municipality records. Publish in the exact QUEUE.json order, ten per batch and two in the last batch. A batch is complete only after its live verification report has zero errors.

## Batch 01: ready for publication

Boonton, Boonton Township, Butler, Chatham Borough, Chatham Township, Chester Borough, Chester Township, Denville, Dover and Harding.

Official sources were read and checked against narrow local claims. ChatGPT's Brand positioning ideas editorial review approved all ten, with a reminder to verify Boonton Township's smoke-inspection responsibilities; the official Construction Department page confirms the distinction. Denville's 2023 newsletter supports only waterway geography, paired with the current NJDEP tool. No parcel-level risk or current insurance rules are inferred.

Validation: 303 tests passed, lint and typecheck passed, Next and Vinext builds passed. Vinext overwrites generated Next route types; rerunning `next typegen` restores them before a subsequent typecheck. Existing middleware/dynamic-import warnings remain unrelated to this content-only task.

Coverage: all 160 service/town combinations have at least ten active emailed vendors with recorded matching coverage. This does not establish specialty, current availability or deliverability.

The release tool defaults to dry-run, enforces exact queued IDs and reviewed digest, compares live updated_at, and records every write. Cache refresh is limited to regenerable HTML/RSC for the ten town paths and directory/county hubs. No runtime, schema, dependency, vendor or outreach changes.
