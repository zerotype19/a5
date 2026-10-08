# Live operations corrections

Owner's first real workflow review authorizes: clearer operator alerts and homeowner receipts; readable priority queue with review/assignment first and newest changes first; faster admin; service-and-town-matched assignable vendors; activation of real email-bearing vendors; vendor form/filter cleanup; personalized vendor opportunity email/page; vendor-reported progress after acceptance; removal of test records from operations.

Preserve manual routing, pre-acceptance privacy, source-backed coverage, and independent reported outcomes. New progress reporting must not automatically mark work fulfilled or assign ratings. Keep network follow-up emails disabled. Archive identified test records with private before-images and revoke their capabilities rather than erase audit history. Owner clarification requested for the older front-steps lead; keep it unless confirmed as test.

Observed: 28,395 vendor-location mappings read through ~57 sequential requests (8.5 seconds in direct measurement); test vendor saved only Madison, Zo Electric correctly covers electrical/Florham Park; 5-minute operator email schedule; no homeowner receipt implementation. Lead88ad accepted and owner confirmed both operator and vendor deliveries.

## Release sequence

1. Apply `20261008140000_live_operations.sql`. It creates the receipt trigger DISABLED so the previous worker cannot mistake a homeowner receipt for an operator alert.
2. Deploy the tested application/worker, with vendor progress enabled and broader network follow-ups still disabled. Verify protected admin loads against the new schema.
3. Enable the receipt trigger using `alter table public.lead_notification_outbox enable trigger homeowner_receipt;`. Enqueue receipts only for genuine submissions during the deployment interval if needed; never replay all historical fixtures.
4. Run the cleanup script dry run, then apply with the private before-image retained. Keep the front-steps lead unless owner identifies it as a test. Verify archive filters, 151 vendor activations, and Zo Electric's electrical/Florham Park eligibility.
5. Verify scheduled transactional delivery and one controlled vendor progress report. Provider acceptance is not inbox-delivery confirmation.

Activation is an internal routing designation, not confirmed participation or availability. Owner explicitly requested email-bearing vendors be Active, superseding prior DISCOVERED routing policy. Existing assignments remain readable; the new coverage trigger applies only to new assignment inserts. Progress writes require an accepted, unexpired, unrevoked capability even with the feature flag enabled; they do not change lifecycle status or create ratings. The private opportunity link currently expires after 72 hours, so later follow-up remains a separate feature.

Validation: 296 unit tests, lint, type checking, Next production build, and disposable PostgreSQL integration suite pass. Browser component check confirms queue contrast and headings inside vendor cards. Nested coverage read returned all 28,395 mappings in ~1.1 seconds versus ~8.5 seconds previously. These are direct data-read measurements, not a production page-speed guarantee.
