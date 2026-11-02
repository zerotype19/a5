# A5 SEO and AI-search performance — November 2, 2026

The site has meaningful indexing coverage but very little customer traffic. The next priority is improving the existing pages earning impressions and turning relevant visits into reviewed requests, rather than expanding the town/service inventory.

## Measured results

| Measure | Observed result | Window / limitation |
|---|---:|---|
| Google web impressions | 1,352 | October 4–31 |
| Google web clicks | 2 | October 4–31 |
| Google reported CTR | 0.1% | Rounded by Search Console |
| Google average position | 58.2 | Across observed queries; not a single keyword rank |
| Google indexed pages | 214 | Indexing report observed November 2; report is delayed |
| Google not indexed | 147 | 124 discovered, 22 noindex, 1 redirect; sampled noindex examples are intentional intake URLs |
| Google generative-AI impressions | 3 | October 4–31, beta report; no click metric was shown |
| GA4 active users / views | 4 / 266 | October 1–31; consented traffic, may include owner/testing activity |
| GA4 events / key events | 469 / 1 | October 1–31; not independently qualified leads |
| Persisted unarchived requests | 1 | October 4–31 Eastern; organic-inferred, NEW, not yet qualified |

The request landed on `/home-services/jersey-city`, selected electrical, and has no canonical town mapping in the record. Review it in the work queue and confirm the location before assignment. No homeowner details are included here. Attribution is browser evidence, not a verified causal link to a particular Google click. No conversion rate is inferred by dividing database requests by GSC clicks.

Search Console's three-month selection has only September 29–October 31 observations: 1,357 impressions and two clicks. Almost all recorded visibility falls in the recent 28-day window, but there is no full prior 28-day baseline for a meaningful growth percentage.

## Where visibility is coming from

| Page | Impressions | Clicks |
|---|---:|---:|
| Running toilet | 249 | 0 |
| Gutter cost guide | 132 | 0 |
| Plumbing cost guide | 102 | 0 |
| Handyman cost guide | 94 | 0 |
| Brick-step repair | 89 | 0 |
| Appliance repair cost guide | 68 | 0 |
| HVAC cost guide | 68 | 0 |

Window: October 4–31. These page-level numbers are not summed into the property total. Search visibility is not evidence that all visitors are local homeowners. Query examples in the broader available period include heating and cooling costs (35), handyman pricing list (26), heating maintenance cost estimate (22), brick step repair (19), and toilet keeps running (19), all with zero reported clicks. One top query uses advanced search operators; do not treat it as a confirmed homeowner-intent query.

The two clicked page rows are the HTTP www homepage (one click, 13 impressions) and Jersey City (one click, one impression). HTTP and apex-host redirects currently return 301 to the canonical HTTPS www host; the historical HTTP row does not establish a current redirect defect.

## AI visibility

Google's beta report lists the homepage, Essex County, Madison masonry and Morristown masonry with one page impression each while the aggregate is three. Preserve the report's aggregate; page rows can overlap and are not additive. This demonstrates a small Google AI-search signal, not established ChatGPT/Perplexity visibility or lead generation. No independent measurement of their citations was available in this review.

Robots permits public crawling. No AI-only files or unsupported schema are needed: [Google's AI guidance](https://developers.google.com/search/docs/appearance/ai-features) emphasizes ordinary crawlability, useful visible content and accurate structured data. No ranking or inclusion guarantee follows.

## Technical findings

Google read the sitemap successfully on November 1 and discovered 337 URLs. The public crawl examined those 337 plus intake; no sitemap page was unreachable through internal links. Twelve requests in the initial concurrent crawl returned Cloudflare 429 rate limits; every affected page returned 200 with one H1, its expected canonical and no noindex on a slower recheck. The other 326 passed the existing HTTP/metadata/head/H1 checks. Do not describe the 429s as permanent broken pages or proof Google is blocked. The audit is now paced and accepts HTML explicitly; security settings stay intact.

Search Console still lacks sufficient field Core Web Vitals data. Old October lab scores are not reused as current performance measurements.

## Improvements in this release

1. Retarget five existing pages' titles, H1s and descriptions to the actual topic: running toilets, gutter cleaning, plumber rates/visit fees, handyman small jobs, and HVAC repair/diagnostics. No invented NJ averages, new price observations or artificial source-review dates.
2. Give cost planning a visible homepage section linking to the four cost guides and the full library. Give the running-toilet page a specific path to plumber costs and the free introduction process.
3. Separate recognized AI referrals in admin Acquisition using existing exact-domain/referral-tag evidence. Preserve paid/campaign precedence, lookalike-domain rejection and unknown attribution. Google AI referrals cannot be separated from ordinary Google referrers through this method. No additional tracking or GA4 event changes.
4. Make public audits slower and keep new audit outputs out of the historical October diagnosis file.

## Next priorities

- Review the new electrical request and its location; record the real outcome before judging lead quality.
- Measure these five pages again after a full 28-day post-release window. Compare impressions, query positions, clicks and reviewed organic requests; do not assume a title change alone solves low rankings.
- Add genuine completed-project evidence and permissioned homeowner reviews when available. These require real facts and consent, not generated testimonials.
- Revisit the 124 discovered URLs using later Search Console data. Do not mass-noindex, generate more permutations or request indexing for hundreds of pages without URL-level evidence.
- Verify a business listing is eligible and owner-approved before creating or changing one. No listing, paid campaign, outreach or recurring automation was created in this task.

Sources: signed-in [Search Console](https://search.google.com/search-console?resource_id=sc-domain%3Aa5homeservices.com), [GA4 property 558009939](https://analytics.google.com/analytics/web/#/a411229070p558009939/reports/intelligenthome), aggregate Supabase readback and public crawl. Private runtime evidence remains under `.wrangler/seo-november/` and is not committed.
