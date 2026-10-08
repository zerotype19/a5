# Consistent generated service imagery

Owner requested removing all repeated illustrative-image notes and clarified that A5 should continue generating images in its original photorealistic style.

Removed captions from the homepage and shared service/town templates, plus obsolete image notes on the projects empty state and terms page. Replaced the eight expansion-service SVGs in public rendering with generated images matching the original hero and Handyman style references: natural warm light, cream siding/interiors, green accents and realistic home details. Original nine raster image sets remain unchanged. No stock photography or claims of completed A5 projects were introduced.

Each new image has a 1440px hero and 640px card WebP variant. Alternative text describes the scene. Town cards now use the shared HomeImage component, fixing paths that previously requested nonexistent WebP files for the eight expansion services. Historical SVG files remain in the repository but are no longer used by the public templates.

No dependencies, schema, database content, tracking or lead-routing changes. Asset size evidence is recorded in ASSETS.json. Release uses the owner's existing deployment authorization.

Validation: 294 tests, lint, generated types/typecheck, Next production build and Vinext/Cloudflare build pass. All eight generated compositions were visually inspected before conversion. Visible note strings no longer occur in public source templates.
