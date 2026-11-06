# Validation — November 6, 2026

- 333 tests pass, including multi-guide visibility/order, draft exclusion, publication/source gates, inbound relationships, unchanged numeric price sections and sitemap eligibility.
- ESLint, TypeScript, Next production build and Cloudflare/Vinext build pass. Existing framework middleware/dynamic-import notices remain; no new dependencies.
- Database dry run passes for 12 new pages, 16 exact-baseline updates, 6 sources and 88 relationships. No operational tables queried or changed for this content work.
- Local desktop library inspected; mobile library and HVAC guide inspected at 390 × 844. No horizontal overflow (document width 375 within viewport 390); all 16 category links present. Gutter section jump resolves to #gutters with heading approximately 112px below viewport top. Complete meta descriptions checked after correcting preview truncation.
- Temporary preview removed and development server stopped before final builds. Generated stale route types were cleared; not a source-code defect.
- Publication uses existing routes/metadata/sitemap and preserves existing price fields, titles, review dates and source records. New content introduces no numerical prices or claimed local market averages.
- Brand chat update sent; no response to the November 6 package was available at validation time. Older advice to prioritize measurement does not override the owner's new explicit expansion request. Keep expansion metrics separate from the November 2 cohort.

Production release and readback evidence will be recorded after deployment.
