# Regional relevance correction

Owner requested removing misleading town lists from general pages or localizing them. Use regional copy and explicit town selection; do not infer visitor location.

Scope: services directory, general-page discovery and related links, remaining Handyman metadata, and search placeholder. Preserve town/county page context and existing canonical routes. No new locations, dependencies, schema, tracking or routing changes. Existing owner release authorization applies.

Audit: 312 published content records; one nonlocal record retains old town-list copy (Handyman meta description). County pages correctly retain county-specific town names. Generic discovery and explicit related-content cards also expose editorial local variants without visitor location.

Validation: all 294 tests passed, including updated discovery coverage proving general pages omit arbitrary local variants while town pages retain their own service links. Lint, generated types/typecheck and Next build passed. The guarded Supabase correction updated only Handyman meta_description; a private before-image is retained. No schema or dependency changes.
