# A5 foundation — homepage as the reference

Owner direction: keep the new homepage look and feel. Operations should be smaller and cleaner, with complete table data and actions in the order they are performed.

## Visual rules

- Manrope in bold, upright styling for the homepage hero and shared A5 wordmark. Fraunces for editorial and section headings; Manrope for reading, controls and the operations workspace. Keep the existing Next font setup; no new fonts or dependencies.
- Warm cream canvas, ivory surfaces, green actions and pale green supporting panels. Public and admin use `src/styles/tokens.css`.
- Public containers use the 72rem content width and shared responsive gutter. Reading copy uses 42rem. Use the shared heading scale, a 500 display weight and comfortable line height.
- Admin uses a 96rem workspace including navigation, 13px tables, 14px body and 16px mobile inputs. Fields wrap within their column. Avoid ellipses for operational data; long table content wraps, and rows become labeled cards on small screens.
- Controls share borders, radii, focus rings and clear pending/disabled states. Use color plus text for status. Preserve keyboard access and reduced-motion behavior.

- Use the shared `Brand` component in public, footer, admin and login headers. Primary conversion label: “Request service”; secondary homepage action: “Explore services”. Positioning centers on making home services easier through preferred local vendors, without unsupported screening or performance claims.

## Reusable templates

| Purpose | Implementation | Required content |
| --- | --- | --- |
| Marketing homepage | Existing home sections and shared shell | Clear promise, service choices, process, geography, FAQ, request action |
| Service / service + town | ServiceLanding + AuthoritySections | Service introduction, illustrative or verified image, common work, preparation, expectations, supporting content, contextual request |
| Problem / guide / location / comparison | AuthorityPage + PageIntro | Breadcrumb, specific heading, answer, differentiated sections, section navigation, sources, related reading, relevant request action |
| Resource collection | ContentIndex | Intro, published/indexable record cards, useful empty state |
| About / policies | Shared template CSS and reading width | Clear sections and readable prose; no invented proof |
| Operations overview / lists | AdminShell + AdminPageHeader + table styles | Clear task, filters, counts with limits, full readable values, links into records |
| Lead detail | Review → classify/qualify → assign/notify → outcome → notes/history | Existing server-authorized actions, inline explanations and feedback |
| Vendor detail | Contact → coverage → credentials → relationship → save | Existing fields and validations grouped in working order |

Do not copy a page and invent a new layout. Extend the relevant template. Keep canonical routes, published-record gating and business rules outside presentation components.

## Admin behavior

- Side navigation on desktop; compact navigation across the top on small screens.
- Overview status cards link to the corresponding lead queue. Lead lists have filters, a reset link and 50-row pagination with stable ordering; filters persist when paging.
- Provider search covers business, contact name, services and towns within loaded records. Counts explicitly describe loaded records, not an uncapped database total.
- Classification precedes qualification; vendor assignment follows qualification; email is a distinct handoff action. Assignment history is expandable. Notes/history follow the active work.
- Do not invent or enable new lifecycle transitions as part of layout cleanup. The existing transition map still limits available outcome actions; extending that map is separate workflow work.
- Forms show pending feedback. Success/error feedback is prominent. Auth, manual assignment decisions and production data remain unchanged.

## Review and verification

Run lint, typecheck, tests, Next build, then vinext build sequentially. Both build tools generate route types, so regenerate Next types if a vinext build preceded typecheck.

For safe visual checks, `node scripts/preview-foundation.mjs` stages a development-only route at `/admin/foundation-preview` using fictional records and the real UI components. Do not submit those forms. Remove it with `node scripts/preview-foundation.mjs --remove` before a release build. The fixture itself lives outside app routes. Production builds must not contain that route.

Review at desktop and 390px: public header/footer, guide outline links, service context, three-stage intake, long admin table values, vendor groups and lead action order. Separately verify authenticated writes in an authorized test environment; fictional UI fixtures do not prove database mutations.
