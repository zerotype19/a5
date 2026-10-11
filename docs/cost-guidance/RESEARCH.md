# A5 cost guidance: research and editorial brief

Reviewed October 11, 2026. Draft research; not published.

## Recommendation

Build a Costs & Planning library that helps homeowners understand an estimate and prepare a better request. Use one cost guide per service, plus a shared homeowner estimate FAQ. Lead with recognizable jobs and what affects the total bill, rather than a single hourly-rate chart.

The initial research covers all 16 service categories. Each category has an original draft introduction, one targeted question and answer, example scopes and a source observation in `content/cost-guidance/research.json`. The separate homeowner FAQ contains ten draft answers. These are starting material, not sixteen completed or publication-verified articles.

## The Facebook plumbing claim

The research did not establish that $235/hour is the average retail plumbing rate across New Jersey. This does not prove that no plumber charges that rate; it means we lack a representative survey supporting the claim. We also lack time-series evidence for the claim that all trades have increased their prices.

A [New Jersey contractor guide from Crest Plumbing](https://crest247.com/blog/how-much-does-a-plumber-charge-per-hour-in-nj) describes standard residential hourly rates of $100–175. This is one business's published guidance, not an independently verified statewide average. Different sources combine hourly labor, first-hour minimums, diagnostics, emergency work and flat-rate jobs differently. A short visit's total should not be described as its hourly rate. Employee wages are not retail customer prices.

Suggested direction for our answer: “An hourly rate alone will not tell you what your plumbing job costs. Ask about the service-call minimum, diagnostic fee, parts and whether the repair is priced by the hour or as a complete job. Get the scope and expected total before work begins.” Add numerical examples only with their source, scope and geography beside them.

## Initial source matrix

**The figures below are research observations from national guides, not A5 prices or verified New Jersey ranges.** They describe different jobs and units and must not be compared as equivalent rates. They need independent corroboration and a check of inclusions before use as featured customer-facing ranges.

| Category | Example job focus | Initial national observation | Source |
| --- | --- | --- | --- |
| Handyman | Door adjustments, shelves, a bundled repair list | 50–150 — USD per labor hour | [Reference](https://www.angi.com/articles/what-are-common-handyman-prices.htm) |
| Masonry | Mortar repair, loose brick steps, localized brick replacement | 500–2,500 — USD per brick repair project | [Reference](https://homeguide.com/costs/repair-brick-masonry-work-cost) |
| Landscaping | Seasonal cleanup, bed refresh, planting | 50–100 — USD per hour for a two-person crew | [Reference](https://homeguide.com/costs/landscaping-costs) |
| Painting | One room, trim, exterior touch-ups | 300–1,000 — USD per room; scope varies | [Reference](https://homeguide.com/costs/cost-to-paint-a-room) |
| Drywall | Small patch, ceiling repair, multiple damaged areas | 300–500 — USD for a small hole under four inches | [Reference](https://homeguide.com/costs/drywall-repair-cost) |
| Tile | Small tile replacement, grout work, backsplash | 10–50 — USD per square foot installed; materials and labor | [Reference](https://homeguide.com/costs/tile-installation-cost) |
| Plumbing | Running toilet, faucet, diagnosis of a leak | 45–150 — USD per labor hour; national published reference | [Reference](https://homeguide.com/costs/average-plumbing-estimates/) |
| Electrical | Outlet diagnosis, light fixture, ceiling fan | 50–130 — USD per labor hour | [Reference](https://homeguide.com/costs/electrician-cost-per-hour) |
| Heating & Cooling | Diagnostic visit, common repair, seasonal maintenance | 150–450 — USD for common HVAC repair; excludes replacement systems | [Reference](https://homeguide.com/costs/hvac-repair-cost) |
| Roofing | Missing shingles, small leak, flashing repair | 150–1,000 — USD for minor roof repair | [Reference](https://homeguide.com/costs/roof-repair-cost) |
| House Cleaning | Recurring clean, first deep clean, move-out | 25–75 — USD per cleaner-hour | [Reference](https://homeguide.com/costs/house-cleaning-prices) |
| Gutter Services | Cleaning, blocked downspout, minor repair | 100–250 — USD for a gutter-cleaning visit | [Reference](https://homeguide.com/costs/gutter-cleaning-cost) |
| Pest Control | One-time treatment, recurring plan, pest identification | 100–600 — USD for a one-time extermination visit | [Reference](https://homeguide.com/costs/pest-control-prices) |
| Junk Removal | One bulky item, partial load, cleanout | 150–350 — USD per typical removal job; source reports wider extremes | [Reference](https://homeguide.com/costs/junk-removal-prices) |
| Tree Services | Pruning, access constraints, debris removal | 400–900 — USD per tree trimmed; not tree removal | [Reference](https://homeguide.com/costs/tree-trimming-cost) |
| Appliance Repair | Diagnostic visit, washer repair, refrigerator fault | 100–400 — USD per repair; parts and complexity vary | [Reference](https://homeguide.com/costs/appliance-repair-costs) |

Most initial numeric observations come from HomeGuide. That concentration limits independence; sixteen rows do not constitute sixteen independent market studies. The junk-removal page displays a May 2024 editorial date despite its current-year title. HVAC and appliance references also have 2025 editorial dates. Refresh those observations before publication. Where a source date was not captured, the matrix records null rather than inventing one.

A [New Jersey cleaning provider's advertised pricing](https://www.thenewjerseymaid.com/updated-new-jersey-maid-service-industry-pricing) offers a useful local observation, but its workforce basis, minimum booking and service-area applicability need confirmation before comparison with per-cleaner national figures. Local provider examples must remain attributed examples, never relabeled market averages.

## Content structure

- `/cost-guides`: a browsable Costs & Planning hub, grouped by the existing services. Give homeowners a clear choice between budgeting for a job and understanding an estimate.
- `/cost-guides/{service}-cost`: sixteen guides with distinct job examples, cost factors and questions. The proposed slugs are recorded in the matrix.
- `/cost-guides/home-service-estimates-faq`: one shared estimate and budgeting FAQ. Keep A5 process questions on How It Works and cross-link where useful.
- Link each guide from its service page and relevant project articles. Link to the service-prefilled request form using the existing intake route. Keep the request CTA separate from price examples so a range does not appear to be a booking price.
- Town pages can link to relevant guides. Do not generate 226 near-identical town price pages or infer town premiums without local evidence.

The repository already has cost-guide routes and a COST_GUIDE content type requiring sources, methodology and a last-reviewed date. The index currently has a noindex directive. Populate and review useful guides through the existing pipeline before changing indexability; the research JSON is deliberately outside that pipeline.

## Repeatable guide template

1. A short answer with a verified, clearly labeled range where available, immediately explaining the job and the basis of pricing.
2. A small table of specific project examples. Every numerical row needs geography, unit, labor/material basis, scope, exclusions and source.
3. What changes the total: access, size, preparation, condition and timing, tailored to that service.
4. What to ask about minimums, diagnostics, materials, disposal and extra work. Do not add a diagnostic fee twice if it is included or credited.
5. How to prepare a useful request: photos, measurements, symptoms and desired result; no risky DIY instructions.
6. Two to five genuinely service-specific questions with direct answers.
7. A service request CTA, related advice, sources and actual last-reviewed date.

Use “national planning reference” where that is the evidence. Do not describe a national range as local merely because the page serves New Jersey. Do not invent inflation adjustments or a New Jersey multiplier. Avoid low-price bait and unusually broad ranges that fail to describe any useful job.

## FAQ and AI/search implications

[Google's Search documentation changelog](https://developers.google.com/search/updates) states that FAQ rich results stopped appearing on May 7, 2026; the related documentation was subsequently removed. A FAQ should therefore be justified by its value to homeowners, not a promise of expanded Google results.

[Google's AI features guidance](https://developers.google.com/search/docs/appearance/ai-features) says normal SEO practices apply and no special schema is required for AI Overviews or AI Mode. Clear, crawlable answers, honest provenance, useful original explanations and strong internal links are sensible foundations; they do not guarantee ranking or AI citations.

Use existing article and breadcrumb patterns as appropriate. Any structured data must match visible content. Do not label third-party planning ranges as A5 offers or guaranteed prices.

## Publication work remaining

For every numerical example, open a second independently sourced reference, reconcile scope and units, and record the result. Prefer current provider-published prices or documented quotes with explicit scope; independent consumer guides can support national context. Contractor marketing articles are commentary, not surveys.

Collect local examples through normal operations over time, with permission where needed and no customer-identifying details in published content. Record service, town/county, date, exact scope, labor/material basis, fees and whether the amount is an estimate or final invoice. A few examples can be useful if honestly labeled; they cannot establish a statewide average. Local sampling is not necessary for publishing clearly labeled national planning guidance once the source and scope checks are complete.

Expand the short drafts into full guides and editorially review them. Start with plumbing, electrical, HVAC, handyman and appliance repair because their visit/diagnostic distinctions illustrate the approach well; this is an editorial priority, not a measured demand ranking. Then complete the other eleven categories.

Before release, verify source links, readable tables on mobile, service-prefilled CTAs, related links, canonical URLs, metadata and sitemap/indexability. Recheck prices quarterly and after material source changes; retain real review dates. No recurring automation has been scheduled.

## Validation of this research batch

All sixteen service IDs have one draft record, a source URL, an explicit pricing unit and a national-geography qualification. All records remain non-indexable drafts. The ten homeowner FAQ answers contain no numerical price claims. No production content, site configuration or database records were changed.

## Brand review

The Brand positioning ideas conversation reviewed this approach on October 11 and supported the hub, sixteen guides and shared FAQ. Its requested emphasis is incorporated here: answer the pricing question early, make quote comparison practical, label every number, and connect the guide to a request without promising a price or a professional response. This is editorial feedback, not independent verification of the pricing evidence.

Suggested CTA: “Have a project in mind? Describe what you need, and A5 will look for a suitable independent professional.”
