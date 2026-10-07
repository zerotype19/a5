# Foundation review — October 7, 2026

Implemented the approved homepage visual direction across shared public templates and operations. The latest owner direction adds a shared A5 wordmark, bold upright homepage headline, clearer service-request CTAs and preferred-vendor positioning.

## Checks

- ESLint and TypeScript passed.
- All 222 tests passed.
- Next production build and Cloudflare/vinext production build passed sequentially.
- Browser checks covered desktop and 390px homepage, public navigation/footer, guide outline anchors, and fictional admin queue, lead workflow and vendor editor.
- Long names and service labels wrap in desktop tables and mobile cards. Mobile navigation closes with Escape and restores toggle focus.
- Temporary admin preview route removed before production builds. Fictional fixtures remain outside application routes.
- Existing build warnings remain for Next middleware convention and vinext chunk imports.

## Boundaries

No dependency additions, database migrations, Supabase architecture changes, production writes, new published records or deployment. Admin visual fixtures do not exercise authenticated database writes; existing action/validation tests passed, and the server action implementations are unchanged.

Lead list pagination now loads 50 records plus one lookahead, preserves filters and orders by timestamp plus ID. Vendor filtering remains within loaded records and labels counts accordingly. Existing lifecycle-transition limits remain; this iteration rearranges operations without adding new transitions.

Content template guidance and an unpublished example are in CONTENT-TEMPLATES.md. Production release is a separate step following review.
