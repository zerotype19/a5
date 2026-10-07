# Coverage and publication boundaries

This package completes browse navigation and a curated expansion, not the full 48-page matrix. It adds 11 local service records and 8 guides and rewrites the existing Madison masonry record. Together with the live corpus, it produces 8 service hubs, 6 town hubs, 12 local service pages, 14 canonical problem articles and 9 guides. The home, about, service directory, town directory and guide collection bring the sitemap to 54 URLs after publication.

| Town | Local service pages in this package |
| --- | --- |
| Florham Park | Handyman, Painting |
| Madison | Masonry (rewrite), Plumbing |
| Chatham | Electrical, Tile |
| Morris Township | Landscaping, Drywall |
| Morristown | Masonry, Painting |
| East Hanover | Landscaping, Plumbing |

Each service also gains one practical planning guide. Existing problem pages remain canonical and link to matching published local service pages. Local pages connect to service and town parents, relevant problems and the planning guide. Both directory entry points are reachable from the main navigation, footer and breadcrumbs.

These selections are editorial coverage, not evidence of search volume, confirmed vendor capacity or prior A5 work. Those business inputs should determine later expansion. Remaining combinations can still be requested through the town hub or service request; absence of a dedicated landing page does not assert that a service is unavailable.

## Reproducible review

1. Obtain a fresh anonymous/public Supabase snapshot of the six authority tables. No lead/vendor/customer tables are involved.
2. Run `node --experimental-strip-types scripts/prepare-authority-expansion.ts /path/to/public-snapshot.json`.
3. Review CONTENT-REVIEW.md, SOURCES.md and MANIFEST.json. The exact database artifact is `.wrangler/authority-expansion/publish.sql`; it is transactional and checks that the existing Madison page has not changed since the snapshot. `dry-run.sql` rolls back all writes.
4. `node scripts/preview-authority-expansion.mjs` stages a local development-only preview at `/authority-preview`. The rendered draft list and two sample directories use in-memory data; canonical navigation still targets live records until publication.
5. Remove the temporary route with `node scripts/preview-authority-expansion.mjs --remove` before production builds.
6. After owner approval, test the SQL in an authorized database transaction, publish the exact reviewed records and deploy the application changes. Record SQL checksum, baseline backup and Worker version. New app code is backward-compatible with the old content inventory.
7. Verify all manifest URLs, canonicals, source links, sitemap inclusion and two-way links. Revalidate content caches or allow the one-hour route cache to expire. Preserve a pre-publication snapshot for rollback; do not delete pre-existing content or relationships.

Publication SQL is an artifact, not an auto-publisher. No service-role key is used for preparing or previewing this package. No migration, dependency, credentials change or production write is required for the build/review step.

## Measurement after release

Record Search Console indexing and query/page impressions for the exact manifest. Review service/town clusters with qualified requests and won jobs using the existing acquisition definitions. Indexable does not mean indexed; schema does not guarantee a search feature or an AI citation. Use a fixed set of homeowner questions for dated manual AI visibility checks, and distinguish cited pages from actual attributed leads.
