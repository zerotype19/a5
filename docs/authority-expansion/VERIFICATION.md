# Verification — October 7, 2026

- ESLint and TypeScript pass.
- 228 tests pass, including draft exclusion, curated coverage, identity preservation, reciprocal parent links, source integrity, discovery filtering and local Service schema.
- Next and vinext/Cloudflare production builds pass sequentially. Existing middleware/chunk warnings remain.
- All 20 draft routes returned 200 in the temporary local review route, with exactly one H1, a draft banner and noindex metadata.
- Desktop local landing and mobile guide/directory layouts inspected in the browser; the 390px directory had clientWidth=scrollWidth=375, with no horizontal overflow.
- Temporary review route removed before production builds; absent from the Next app route manifest.
- Anonymous Supabase snapshot read only public authority tables. No customer/lead/provider data was used.
- Owner approved publication and deployment. Authenticated publication preflight verified the exact reviewed content hash and unchanged Madison record. Sources and links were staged against private draft records, then all 20 pages were published in one atomic Supabase/PostgREST batch. The SQL alternative was not executed.
- Original records, manifest and publication receipt are retained under ignored `.wrangler/authority-expansion/`; existing content, sources and relationships were preserved.
- Mobile corrections: separated intake sections; removed the programmatic H1 focus outline; tightened choices and form navigation; compact Turnstile to fit narrow screens; consistent mobile header/menu/footer; safe-area bottom clearance only where the contact bar exists; area context preserved by the mobile request CTA.
- Browser checked all three intake steps at 390px and contact at 320px without a lead submission; no horizontal overflow and no focused-heading outline. Home and mobile menu inspected at 390px. Live deployment checks are recorded in the local release receipt.
- No claim of ranking, indexing or AI citations is made.

No dependencies, database migrations or production configuration changes. Supabase remains the content/backend authority. PR #23 was merged and deployed as Cloudflare Worker version `1130f638-3d59-4608-99b5-51c1702698ee`. Live verification found 49 published content records and 54 sitemap URLs. All 54 returned 200 with one H1, a valid canonical and parseable structured data; all 20 reviewed records, source links and relationships matched the approved package. Four additional routes confirmed intake 200, unauthenticated admin redirect and absent temporary previews. Live mobile intake progressed through all three steps without submission; the compact security widget fits the 320px form. A final narrow-screen CTA correction gives the longer request label more room so the fixed bar remains within its reserved clearance. Final Worker version and responsive checks are retained in the deployment receipt.
