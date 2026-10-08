# SEO readiness — October 8, 2026

## Scope and status

This release improves six existing service/town pages and promotes eight individually reviewed town guides. It does not make every municipality profile ready for indexing. After the guarded manifest is applied, 202 town profiles deliberately remain noindex. The site continues to offer all 16 services across its 226-municipality registry. No vendor records or lead-routing rules change.

The eight towns are Paramus, Bloomfield, Hoboken, Randolph, Clifton, Cranford, Newton and Hackettstown. Source claims and the exact manifest digest are in CONTENT-REVIEW.json. COVERAGE-MATRIX.json records at least ten active, email-bearing mapped vendors for every service/town combination in this batch; this is recorded assignment eligibility, not confirmed availability or mailbox deliverability.

## Google evidence

Search Console's aggregate report (October 3; examples through October 5) lists 16 discovered and six crawled examples. URL Inspection on October 8 already shows Florham Park indexed with the intended Google canonical, so the aggregate list is stale. Madison/masonry remains discovered without a last-crawl date. The intentionally noindex request form is not an indexing defect. INDEXING-DIAGNOSIS.json preserves URL-level checks and interpretation. Neither HTTP 200 nor sitemap inclusion proves Google indexing.

Search Console Core Web Vitals reports insufficient usage for both mobile and desktop in the last 90 days. Field performance cannot yet be certified.

## Mobile laboratory baseline

PageSpeed Insights mobile reports checked October 8. Scores are lab observations, not field guarantees.

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| / | 87 | 100 | 100 | 100 | 3.8s | 0 |
| /services | 88 | 100 | 100 | 100 | 2.4s | 0 |
| /madison/masonry | 88 | 100 | 100 | 92 | 3.6s | 0 |
| /services/plumbing/running-toilet | 95 | 100 | 100 | 91 | 2.6s | 0 |
| /request-service | 93 | 100 | 100 | 66 | 2.7s | 0 |

The intake SEO score reflects deliberate noindex. Content-page SEO losses exposed descriptions and canonicals rendered under a body div. `htmlLimitedBots: /.*/` uses the supported metadata-blocking path for all clients. Nine representative production Worker routes pass raw-head checks for browser and Googlebot UAs; rendered DOM retains metadata in HEAD. Social images now cover all service categories and service/town pages. Existing 640/1440 hero variants use responsive srcset; no new imagery is represented as completed A5 work.

Reports: [home](https://pagespeed.web.dev/analysis/https-www-a5homeservices-com/i48acvz1iw?form_factor=mobile), [services](https://pagespeed.web.dev/analysis/https-www-a5homeservices-com-services/8pfpns5xmj?form_factor=mobile), [Madison masonry](https://pagespeed.web.dev/analysis/https-www-a5homeservices-com-madison-masonry/c5ykglq2ub?form_factor=mobile), [running toilet](https://pagespeed.web.dev/analysis/https-www-a5homeservices-com-services-plumbing-running-toilet/a2f0wfak1m?form_factor=mobile), [intake](https://pagespeed.web.dev/analysis/https-www-a5homeservices-com-request-service/dpkzhkhgtb?form_factor=mobile).

## Measurement

GA4 property 558009939, web stream 16063200619, G-ZLD8SRP78F: stream reports traffic in the last 48 hours, recent events include request_started and request_submitted. request_submitted is now a key event; request_started remains a normal event. Enhanced Measurement is off. Existing code emits submission only after successful canonical persistence; failed requests do not count.

Admin Acquisition now reports all unarchived requests created in the last 30 days, paginating beyond the API row cap. It groups first channel, landing path, service and town, with current eligible, excluded and won status counts. Missing attribution remains Direct / unknown, paid click IDs take precedence over search referrers, and no homeowner details are sent to GA4. This is an operational cohort report, not a historical funnel or proof of completed work. GA4 and Search Console totals are compared in aggregate, not joined to individual homeowners. No synthetic production request was generated for this release.

## Validation and remaining work

301 tests, lint, typecheck, Next build and Vinext Worker build pass. Temporary content preview removed before builds. Local mobile checks at 320 and 390 pixels and desktop show no horizontal overflow. `scripts/check-seo-metadata.mjs` verifies HTTP head placement/uniqueness and UA parity. `scripts/audit-seo-readiness.mjs` checks the complete public sitemap and internal reachability. Private deployment receipts and detailed runtime evidence stay under ignored .wrangler/seo-readiness.

Further work is evidence-driven: repeat the editorial process for the remaining 202 noindex profiles, use actual search queries and persisted lead quality to choose future content, and add genuine permissioned project evidence and customer reviews when available. Do not fabricate local offices, completed projects, testimonials or ratings. Google's crawl/indexing decisions and real-user performance need subsequent observations; this release does not promise rankings or lead volume.

## Production release and follow-up

PR47 merged as 9893e9d; Worker a0b3ed83-a5bf-4168-8b14-78a11d73f03e deployed October 8. The guarded release completed all 14 page updates, eight sources, eight source links and eight county relationships. Deep comparison confirms authored fields match; all other indexability flags are unchanged. Published content remains 312 records, 110 indexable, with 25 indexable LOCATION records (including legacy Chatham) and 202 noindex.

The live crawl passes all 116 sitemap URLs plus intake (117 total), with zero HTTP, metadata-head, canonical, H1 or reachability errors. All 18 browser/Googlebot metadata checks pass. Google live-tested Madison/masonry as available and accepted its indexing request into the priority crawl queue. Google accepted the updated sitemap submission; submission does not mean immediate processing/indexing.

Post-release Madison/masonry mobile PSI: performance 88, accessibility/best-practices/SEO 100, LCP 3.6s, CLS 0. Homepage samples were slower (71/73 performance, LCP 6.2s, SEO100). The dependency tree shows intake-form, validation and Turnstile chunks loading through automatic request-CTA prefetch. A narrow follow-up disables that prefetch in the shared Button, mobile actions, footer and homepage request link; request navigation remains intact. Further lab results must be reported honestly, not averaged into a claimed field pass.
