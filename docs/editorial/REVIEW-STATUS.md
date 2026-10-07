# Existing-content cleanup — wave 2

The owner directed continued content and geographic expansion through completion, following the earlier release authorization. The final 22-record editorial package is included in the 35-record wave 2 manifest. See [release record](../expansion-wave-2/RELEASE.md) for publication status.

## Review completed

- Eight service hubs and fourteen problem pages have self-contained answers, clearer introductions, grouped photo guidance and specific calls to action.
- Removed electrical breaker-reset and fault-reproduction instructions; changed diagnostic certainty into observations for professional assessment. Removed door-trimming advice and unverified claims that A5 has checked every provider's credentials.
- Kept technical guidance conditional on assessment. No new prices, timelines, credential guarantees, projects or reviews were invented. References are planning background, not evidence about A5's provider roster or the cause of a particular property's damage.
- Reviewed EPA water-leak, moisture and lead guidance; USG repair-material guidance; BIA repointing; CMHA paver maintenance; Schluter waterproofing; NJ One Call private facilities; municipal construction references. Source URLs and publishers are in content/expansion-wave-2/sources.json and geo-drafts.json.
- ESFI and NJ electrical licensing summaries were confirmed through official indexed source text after direct requests timed out or returned 403. The existing NJ plumbing FAQ was not fully retrievable; it remains a regulatory reference, with no new detailed licensing interpretation added. No field inspection or professional certification of these articles is implied.
- All 35 changed pages rendered with one H1, no horizontal overflow and no emoji/text arrows at 390px. Representative town and request pages passed at 320px, and a local-service page passed at desktop width. Temporary preview routes were removed before production builds.

## Publication controls

The manifest fixes 22 existing IDs and 13 new IDs. Existing records retain URLs, metadata and original publication dates. Publication checks each original updated_at and uses a conditional PATCH for every row. The complete baseline and per-row receipt are saved privately under .wrangler/expansion-wave-2. Sources and relationships are staged before publication; vendor records are not changed.

Paid pilot spending remains deferred. Actual availability and credentials are checked for each proposed provider; new-town pages explicitly describe a request review rather than confirmed coverage.
