# Footer analytics preferences

Owner request: remove the floating privacy/analytics prompt and move the controls into the footer.

Acceptance: a closed, inline footer disclosure on public pages; no overlay on desktop or mobile; retain explicit analytics opt-in, saved choices, revocation, and existing non-PII event behavior. Admin and opportunity routes remain excluded. Privacy copy identifies the footer control. No schema, dependencies, or vendor changes.

Validation: 247 tests passed; ESLint, Next build, TypeScript, and vinext production build passed. Browser checks confirmed no GA script before opt-in, loading after opt-in, saved consent after reload, closed disclosure after reload, and removal after revocation. Mobile (390px) footer wraps without horizontal overflow. Existing mobile action bar is unchanged.
