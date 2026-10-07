# No-emoji presentation rule

Owner request, October 7, 2026: no emojis anywhere in the public site or admin. Use simple SVG icons for directional or functional cues. Do not use Unicode emoji glyphs or emoji fonts as UI icons. Keep decorative icons hidden from assistive technology and preserve descriptive link/button text.

Replaced all rendered text arrow glyphs with the shared ArrowIcon SVG in the homepage, service/article/directory templates, mobile actions and admin navigation. SVGs inherit text color, scale with surrounding type and cannot switch to platform emoji presentation. Copyright text remains ordinary legal text.

The source scan found no other UI emojis, and a fresh scan of all 49 published content records found none. No content records, URLs, schema, lead data or dependencies changed. The unpublished editorial drafts remain in their separate PR.

Verification: 236 tests passed; lint, TypeScript, Next production build and vinext Worker build passed. Mobile preview at 390 pixels showed the replacement arrows, no emoji text and no horizontal overflow (375-pixel client and scroll widths after the scrollbar). Existing link destinations and accessible labels remain intact.
