# Town profile publication progress

Initial scope: 202 existing published/noindex municipality records. Publish in the exact QUEUE.json order, ten per batch and two in the last batch. A batch is complete only after its live verification report has zero errors.

## Batch 01: ready for publication

Boonton, Boonton Township, Butler, Chatham Borough, Chatham Township, Chester Borough, Chester Township, Denville, Dover and Harding.

Official sources were read and checked against narrow local claims. ChatGPT's Brand positioning ideas editorial review approved all ten, with a reminder to verify Boonton Township's smoke-inspection responsibilities; the official Construction Department page confirms the distinction. Denville's 2023 newsletter supports only waterway geography, paired with the current NJDEP tool. No parcel-level risk or current insurance rules are inferred.

Validation: 303 tests passed, lint and typecheck passed, Next and Vinext builds passed. Vinext overwrites generated Next route types; rerunning `next typegen` restores them before a subsequent typecheck. Existing middleware/dynamic-import warnings remain unrelated to this content-only task.

Coverage: all 160 service/town combinations have at least ten active emailed vendors with recorded matching coverage. This does not establish specialty, current availability or deliverability.

The release tool defaults to dry-run, enforces exact queued IDs and reviewed digest, compares live updated_at, and records every write. Cache refresh is limited to regenerable HTML/RSC for the ten town paths and directory/county hubs. No runtime, schema, dependency, vendor or outreach changes.

## Batch 01: published and verified

2026-10-08: PR #50 merged (e0e8577); exact ten-record guarded release completed. Live verification: 10/10 HTTP 200, correct unique titles/descriptions, index/follow, canonicals, valid structured data, county inbound links and all 16 contextual intake links. Sitemap increased from 116 to 126 URLs. Boonton article and service cards were also inspected in a 390px browser viewport with no horizontal overflow. Ten completed; 192 remain.

## Batch 02: ready for publication

Jefferson Township, Kinnelon, Lincoln Park, Long Hill Township, Mendham Borough, Mendham Township, Mine Hill, Montville, Morris Plains and Mount Arlington. Current official municipal pages and Kinnelon's 2025 directory support narrow local distinctions; no fees, hours, universal permit rules or parcel flood claims copied. Brand positioning ideas editorial review approved all ten. All 160 service/town combinations retain at least ten active emailed mapped vendors. Tests, lint, typecheck and Next build passed. No runtime changes.

## Batch 02: published and verified

2026-10-08: PR #51 merged (09778ba). Ten guarded updates applied and 10/10 live checks passed with zero errors. Sitemap: 136 URLs. Twenty completed; 182 remain.

## Batch 03: ready for publication

Mount Olive, Mountain Lakes, Netcong, Pequannock, Riverdale, Rockaway Borough, Rockaway Township, Roxbury, Victory Gardens and Washington Township (Morris). Brand positioning ideas approved all ten. Official sources support the local project guidance; no collection dates, fees or property-specific approvals inferred. All 160 service/town combinations retain at least ten mapped active emailed vendors. Tests, lint, typecheck and Next build passed. Wharton remains the final Morris municipality and begins batch 04.

## Batch 03: published and verified

2026-10-08: PR #52 merged (1ccdfaf). Ten guarded updates applied; live verification passed 10/10 with zero errors. Sitemap: 146 URLs. Thirty completed; 172 remain.

## Batch 04: ready for publication

Wharton completes Morris; Belleville, Caldwell, Cedar Grove, East Orange, Essex Fells, Fairfield, Glen Ridge, Irvington and Maplewood begin Essex. Editorial review approved all ten; its Maplewood wording refinement was incorporated. Official resources support narrow local claims, with exact property responsibility and approvals left to the relevant office. All 160 service/town combinations retain at least ten mapped active emailed vendors. Tests, lint, typecheck and Next build passed. No runtime changes.

## Batch 04: published and verified

2026-10-08: PR #53 merged (0fdf461). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 156 URLs. Forty completed; 162 remain. Glen Ridge's article was inspected at 390px with readable wrapping and no horizontal overflow; temporary viewport reset.

## Batch 05: ready for publication

Millburn, Newark, North Caldwell, Nutley, Orange, Roseland, South Orange, Verona, West Caldwell and West Orange complete the remaining Essex profiles. Editorial review approved all ten. Official sources support narrow local distinctions; South Orange separates contamination remediation from ordinary cleaning and West Orange uses current Forestry guidance. Coverage retains at least ten active emailed mapped vendors for all 160 combinations. Tests, lint, typecheck and Next build passed.

## Batch 05: published and verified

2026-10-08: PR #54 merged (cb7d739). Ten guarded updates applied; live verification passed 10/10 with zero errors. Sitemap: 166 URLs. Fifty completed; 152 remain.

## Batch 06: ready for publication

Allendale, Alpine, Bergenfield, Bogota, Carlstadt, Cliffside Park, Closter, Cresskill, Demarest and Dumont begin Bergen. Brand positioning ideas approved all ten. Source checks distinguish Closter design guidance from property approval, Alpine septic expertise from general plumbing, and permitted project inspections from universal requirements. Coverage retains ten or more active emailed mapped vendors for all 160 combinations. Tests, lint, typecheck and Next build passed.

## Batch 06: published and verified

2026-10-08: PR #55 merged (91a147d). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 176 URLs. Sixty completed; 142 remain.

## Batch 07: ready for publication

East Rutherford, Edgewater, Elmwood Park, Emerson, Englewood, Englewood Cliffs, Fair Lawn, Fairview, Fort Lee and Franklin Lakes. Brand positioning ideas approved all ten. Official sources distinguish transaction-related occupancy from repairs, public road authority from private ownership, and septic expertise from general plumbing. All 160 combinations retain at least ten active emailed mapped vendors. Tests, lint, typecheck and Next build passed.

## Batch 07: published and verified

2026-10-08: PR #56 merged (ce7a0c8). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 186 URLs. Seventy completed; 132 remain. Closter's published article was also checked at 390px with clean wrapping and no horizontal overflow; viewport reset.

## Batch 08: ready for publication

Garfield, Glen Rock, Hackensack, Harrington Park, Hasbrouck Heights, Haworth, Hillsdale, Ho-Ho-Kus, Leonia and Little Ferry. Brand positioning ideas approved all ten. Leonia's source was verified in the live browser after HTTP blocking; no credentials required. Official guidance supports specific local planning distinctions, without parcel flood claims or broad permit exemptions. Tests, lint, typecheck and Next build passed. All 160 service/town combinations retain at least ten active emailed mapped vendors.

## Batch 08: published and verified

2026-10-08: PR #57 merged (66afebe). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 196 URLs. Eighty completed; 122 remain.

## Batch 09: ready for publication

Lodi, Lyndhurst, Mahwah, Maywood, Midland Park, Montvale, Moonachie, New Milford, North Arlington and Northvale. Brand positioning ideas approved all ten. Official sources support narrow local guidance; Montvale and New Milford were verified in the live browser. All 160 combinations retain at least ten active emailed mapped vendors. Tests, lint, typecheck and Next build passed. No runtime changes.

## Batch 09: published and verified

2026-10-08: PR #58 merged (27f86ab). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 206 URLs. Ninety completed; 112 remain.

## Batch 10: ready for publication

Norwood, Oakland, Old Tappan, Oradell, Palisades Park, Park Ridge, Ramsey, Ridgefield, Ridgefield Park and River Edge. Brand positioning ideas approved all ten. Official sources support narrow homeowner guidance; no outdated tree thresholds, utility rates or inspection guarantees copied. Tests, lint, typecheck and Next build passed. All 160 service/town combinations retain at least ten active emailed mapped vendors.

## Batch 10: published and verified

2026-10-08: PR #59 merged (9977d91). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 216 URLs. One hundred completed; 102 remain.

## Batch 11: ready for publication

River Vale, Rochelle Park, Rockleigh, Rutherford, Saddle Brook, Saddle River, South Hackensack, Teaneck, Tenafly and Teterboro. Brand positioning ideas approved all ten. Official sources support narrow local guidance; Rutherford was verified in the live browser. Unread EV and historic-guideline provisions are not asserted. Tests, lint, typecheck and Next build passed. All 160 service/town combinations retain at least ten active emailed mapped vendors.

## Batch 11: published and verified

2026-10-08: PR #60 merged (8e26ef8). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 226 URLs. One hundred ten completed; 92 remain.

## Batch 12: ready for publication

Upper Saddle River, Waldwick, Wallington, Washington Township (Bergen), Westwood, Wood-Ridge, Woodcliff Lake, Wyckoff, Berkeley Heights and Clark finish Bergen and begin Union. Brand positioning ideas approved all ten. Wallington, Washington Township and Wood-Ridge sources verified in live browser. All 160 service/town combinations retain at least ten active emailed mapped vendors. Tests, lint, typecheck and Next build passed.

## Batch 12: published and verified

2026-10-08: PR #61 merged (6d46b27). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 236 URLs. One hundred twenty completed; 82 remain.

## Batch 13: ready for publication

Elizabeth, Fanwood, Garwood, Hillside, Kenilworth, Linden, Mountainside, New Providence, Plainfield and Rahway. Brand positioning ideas approved all ten. Official sources support narrow local guidance; engineering, equipment qualifications and historic designation remain separate from service-category matching. All 160 combinations retain at least ten active emailed mapped vendors. Tests, lint, typecheck and Next build passed.

## Batch 13: published and verified

2026-10-08: PR #62 merged (a359967). Ten guarded updates applied; 10/10 live checks passed with zero errors. Sitemap: 246 URLs. One hundred thirty completed; 72 remain.

## Batch 14: ready for publication

Roselle, Roselle Park, Scotch Plains, Springfield, Union Township, Winfield, Bloomingdale, Haledon, Hawthorne and Little Falls finish Union and begin Passaic. Brand positioning ideas approved all ten. Source-backed distinctions include solar coordination, changes to approved plans and written contractor expectations. All 160 combinations retain at least ten active emailed mapped vendors. Tests, lint, typecheck and Next build passed.
