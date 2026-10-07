# Measurement contract

Business truth remains in Postgres. GA4 measures consented behavior, not canonical lead counts. The new acquisition summary reports first-source requests and currently WON records for a rolling 30-day window, limited to 1,000 acquisition rows. Historical stages are in lead status events, not inferred from the current status alone. Missing attribution is unknown, not assumed organic.

| Event | Trigger | Allowed parameters |
| --- | --- | --- |
| page_view | Consented public navigation | Sanitized origin + path, title; no query or full referrer |
| request_started | Intake mounted with analytics permitted | No form values |
| request_step_completed | Valid project/details stage continued | project or details |
| request_validation_error | Stage blocked by client validation | project or details |
| request_submitted | Canonical API confirms a committed lead | No lead ID/reference/contact fields |
| request_failed | API/network submission failure | No error details or user values |
| call_clicked | Public tel link clicked | No phone number; this is not a completed call |

Analytics disabled or declined means those visits do not appear. Turning consent on midway through the form may mean request_started was not observed; do not equate event totals to the database. No marketing consent is inferred from a service request.

First and last acquisition are browser-reported evidence with timestamps, landing path, external referring host and the available allowlist: utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, msclkid. Session storage is fallible. The first touch is preserved; internal navigation does not replace the latest acquisition touch. Idempotent submission does not overwrite the lead's acquisition record. Raw URL query strings, referrer paths and arbitrary client keys are discarded. UTM creators must never include personal data. KNOWN means an observed supplied field, not independently verified source identity, deterministic keyword attribution or proof of causality.

Pilot sheet columns: week, service, town, campaign, spend, submitted leads, invalid/duplicate/unserviceable leads, qualified leads, provider-accepted, first-contact time, estimates, wins, A5 retained income, direct fulfillment costs, acquisition costs, contribution.

- Qualified CPL = spend / qualified leads (undefined when denominator is zero).
- Acquisition cost = attributable spend / new won customers (avoid counting repeat jobs as new customers).
- Lead-to-win rate = won leads / submitted eligible leads within a consistent cohort and maturity window.
- First-response time = actual homeowner contact timestamp minus creation timestamp, with staffed-hours context.
- A5 contribution = A5 retained income minus direct fulfillment costs minus acquisition costs. Contractor invoice total is not A5 revenue in a referral model.
- Allowable qualified CPL = target acquisition cost × qualified-lead-to-new-customer rate.

A pilot budget is an owner decision. Start with two or three ready services in verified coverage, use a capped experiment and compare mature cohorts. Diagnose low volume before interpreting rates. Stop/pause if fulfillment fails, tracking fails or the pre-agreed loss ceiling is reached. Do not optimize just for cheap form fills.

SEO/GEO scorecard: eligible indexed pages, service/town impressions and clicks, landing engagement, qualified requests and wins. Add a stable set of factual homeowner questions for periodic manual AI visibility checks; record date, engine, prompt and cited URL. A mention is not a lead and a missing referrer is not proof of AI traffic. Search Console query reports are aggregate, not user-level attribution.

## October 7 configuration and limitations

Owner-supplied GA4 stream: `G-ZLD8SRP78F`. Keep build-time activation pending verification of the stream's automatic-event settings and consent behavior. Chrome account access is verified. A5 property 558009939 / stream 16063200619 matches the supplied ID; Enhanced Measurement has been turned off. Build configuration is prepared, not deployed. Consent traffic checks and Search Console property verification remain pending. Pilot budget, initial services and expansion priorities are deferred by the owner.

The new outcome workflow records when an operator marks contact, estimate or closure. These are recorded-at timestamps, not independent proof of the actual contact time; historical/backfilled status changes must not be used as exact response-time evidence. Estimated and actual amounts are provider project values. A5 income/contribution still requires an agreed definition and separate reconciliation.
