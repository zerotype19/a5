-- A5-G002 service hubs (seed) — SEPARATE from schema migrations
-- Status: REVIEW, indexable=false. Cursor does not publish.
-- Problem rows are entities only. Downstream page types are not inserted.
-- Masonry updates the existing G001 SERVICE fixture (10000000-0000-4000-8000-000000000001)
-- because content_pages allows one SERVICE row per service.
-- The other four G001 fixtures are not modified.
-- Apply only to non-production. Owner publication is a separate decision.

insert into public.problems (id, slug, name, description)
values (
  'sticking-interior-door',
  'sticking-interior-door',
  $pname$Sticking interior door$pname$,
  $pdesc$An interior door that rubs, sticks, or no longer latches after seasonal movement or a loose hinge.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'loose-or-damaged-trim',
  'loose-or-damaged-trim',
  $pname$Loose or damaged trim$pname$,
  $pdesc$Baseboard, casing, or other interior trim that is loose, split, or pulling away from the wall.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'wall-mounting',
  'wall-mounting',
  $pname$Wall mounting$pname$,
  $pdesc$Mounting a television, shelf, curtain rod, or similar item where the homeowner wants it fastened securely.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'worn-door-hardware',
  'worn-door-hardware',
  $pname$Worn door hardware$pname$,
  $pdesc$A handle, lockset, hinge, or closer that is loose, worn, or no longer operating smoothly.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'punch-list-repairs',
  'punch-list-repairs',
  $pname$Punch-list repairs$pname$,
  $pdesc$A short list of small finish repairs after other work, or a set of minor items the homeowner wants handled together.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'small-carpentry-repair',
  'small-carpentry-repair',
  $pname$Small carpentry repair$pname$,
  $pdesc$A limited wood repair such as a shelf, casing return, or small section of trim — not a full remodel.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

-- Existing G001 problem. Keep its row; ensure the masonry link.
insert into public.problems (id, slug, name, description)
values (
  'brick-step-repair',
  'brick-step-repair',
  $pname$Brick step repair$pname$,
  $pdesc$Brick front steps that are cracking, shifting, crumbling, or becoming uneven.$pdesc$
)
on conflict (id) do nothing;

insert into public.problems (id, slug, name, description)
values (
  'sunken-pavers',
  'sunken-pavers',
  $pname$Sunken pavers$pname$,
  $pdesc$Patio or walkway pavers that have settled, rocked, or created a trip edge.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'loose-mortar',
  'loose-mortar',
  $pname$Loose mortar$pname$,
  $pdesc$Mortar joints that are cracking, receding, or falling out of brick or stone.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'damaged-brick-walkway',
  'damaged-brick-walkway',
  $pname$Damaged brick walkway$pname$,
  $pdesc$A brick walk that is heaving, broken, or uneven underfoot.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'uneven-stone-patio',
  'uneven-stone-patio',
  $pname$Uneven stone patio$pname$,
  $pdesc$A stone or paver patio surface that has shifted and is no longer a comfortable walking surface.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'shifting-retaining-wall',
  'shifting-retaining-wall',
  $pname$Shifting retaining wall$pname$,
  $pdesc$A low masonry retaining wall that is leaning, separating, or losing stones. Structural engineering is a separate question when movement is severe.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'overgrown-planting-beds',
  'overgrown-planting-beds',
  $pname$Overgrown planting beds$pname$,
  $pdesc$Beds that have filled with weeds, crowded plants, or spent growth the homeowner wants cleaned up.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'landscape-cleanup',
  'landscape-cleanup',
  $pname$Landscape cleanup$pname$,
  $pdesc$A yard that needs debris, leaves, or overgrowth cleared so the property is usable again.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'new-planting-beds',
  'new-planting-beds',
  $pname$New planting beds$pname$,
  $pdesc$A homeowner who wants beds edged, soil improved, and plants installed as a defined landscape project.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'yard-surface-grading',
  'yard-surface-grading',
  $pname$Yard surface grading$pname$,
  $pdesc$A lawn or bed area where surface water sits because the grade slopes toward the house or a low spot. This is landscape grading, not a buried drainage system design.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'seasonal-yard-cleanup',
  'seasonal-yard-cleanup',
  $pname$Seasonal yard cleanup$pname$,
  $pdesc$Spring or fall cleanup: leaves, cutbacks, and bed refresh rather than a full redesign.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'worn-interior-paint',
  'worn-interior-paint',
  $pname$Worn interior paint$pname$,
  $pdesc$Walls or ceilings whose paint is scuffed, faded, or ready for a fresh coat.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'peeling-exterior-paint',
  'peeling-exterior-paint',
  $pname$Peeling exterior paint$pname$,
  $pdesc$Exterior siding or trim where paint is peeling, chalking, or failing and needs preparation before recoating.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'trim-paint-failure',
  'trim-paint-failure',
  $pname$Trim paint failure$pname$,
  $pdesc$Window, door, or base trim whose paint is chipped or peeling while the surrounding walls may be fine.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'paint-after-patching',
  'paint-after-patching',
  $pname$Paint after patching$pname$,
  $pdesc$A wall or ceiling that has been repaired and now needs paint so the patch disappears.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'hole-in-drywall',
  'hole-in-drywall',
  $pname$Hole in drywall$pname$,
  $pdesc$A puncture, doorknob hole, or missing piece of drywall the homeowner wants patched.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'drywall-crack',
  'drywall-crack',
  $pname$Drywall crack$pname$,
  $pdesc$A crack in a wall or ceiling that may be cosmetic or may need to be opened and retaped.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'ceiling-drywall-damage',
  'ceiling-drywall-damage',
  $pname$Ceiling drywall damage$pname$,
  $pdesc$A ceiling that is sagging, cracked, or opened and needs drywall repair rather than paint alone.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'water-damaged-ceiling',
  'water-damaged-ceiling',
  $pname$Water-damaged ceiling$pname$,
  $pdesc$A ceiling stain, bubble, or soft spot after a leak. The leak source, the drywall, and the finish are often separate parts of the same homeowner problem.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'unfinished-drywall-repair',
  'unfinished-drywall-repair',
  $pname$Unfinished drywall repair$pname$,
  $pdesc$A patch that was started but not taped, coated, or sanded to a paintable surface.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'cracked-floor-tile',
  'cracked-floor-tile',
  $pname$Cracked floor tile$pname$,
  $pdesc$One or more floor tiles that are cracked and need replacement rather than a full floor redo.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'loose-backsplash-tile',
  'loose-backsplash-tile',
  $pname$Loose backsplash tile$pname$,
  $pdesc$Kitchen or bath backsplash tiles that have loosened or fallen.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'bathroom-floor-tile-repair',
  'bathroom-floor-tile-repair',
  $pname$Bathroom floor tile repair$pname$,
  $pdesc$Bathroom floor tile that is cracked, loose, or missing in a limited area.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'crumbling-grout',
  'crumbling-grout',
  $pname$Crumbling grout$pname$,
  $pdesc$Grout that is cracking or washing out. This is a repair need, not a claim of specialty stone restoration.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'cracked-shower-tile',
  'cracked-shower-tile',
  $pname$Cracked shower tile$pname$,
  $pdesc$Shower wall tile that is cracked or loose. Waterproofing behind the tile is part of the project question, not something A5 diagnoses from a photo alone.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'dripping-faucet',
  'dripping-faucet',
  $pname$Dripping faucet$pname$,
  $pdesc$A faucet that drips or a handle that no longer shuts the water off cleanly.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'running-toilet',
  'running-toilet',
  $pname$Running toilet$pname$,
  $pdesc$A toilet that keeps running, refills constantly, or has a weak flush.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'visible-pipe-leak',
  'visible-pipe-leak',
  $pname$Visible pipe leak$pname$,
  $pdesc$A leak the homeowner can see at a pipe, valve, or supply line. Not an emergency-dispatch promise.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'fixture-replacement',
  'fixture-replacement',
  $pname$Fixture replacement$pname$,
  $pdesc$Replacing a faucet, toilet, or similar plumbing fixture as a planned project.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'water-heater-replacement-project',
  'water-heater-replacement-project',
  $pname$Water heater replacement project$pname$,
  $pdesc$A water heater the homeowner wants replaced or evaluated as a scheduled project rather than an urgent dispatch.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'failed-light-fixture',
  'failed-light-fixture',
  $pname$Failed light fixture$pname$,
  $pdesc$A light that does not work, flickers, or needs the fixture itself replaced.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'dead-outlet',
  'dead-outlet',
  $pname$Dead outlet$pname$,
  $pdesc$An outlet that has no power or works intermittently.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'faulty-switch',
  'faulty-switch',
  $pname$Faulty switch$pname$,
  $pdesc$A switch that is loose, cracked, or no longer controls the light reliably.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'ceiling-fan-project',
  'ceiling-fan-project',
  $pname$Ceiling fan project$pname$,
  $pdesc$Installing or replacing a ceiling fan, including the question of whether the box and wiring can support it.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'lighting-update',
  'lighting-update',
  $pname$Lighting update$pname$,
  $pdesc$A planned change of lighting fixtures in a room or on a porch.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problems (id, slug, name, description)
values (
  'recurring-electrical-issue',
  'recurring-electrical-issue',
  $pname$Recurring electrical issue$pname$,
  $pdesc$A circuit, fixture, or device that keeps failing and needs a qualified electrical professional to look at the cause.$pdesc$
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description;

insert into public.problem_services (problem_id, service_id)
values
  ('sticking-interior-door', 'handyman'),
  ('loose-or-damaged-trim', 'handyman'),
  ('wall-mounting', 'handyman'),
  ('worn-door-hardware', 'handyman'),
  ('punch-list-repairs', 'handyman'),
  ('small-carpentry-repair', 'handyman'),
  ('brick-step-repair', 'masonry'),
  ('sunken-pavers', 'masonry'),
  ('loose-mortar', 'masonry'),
  ('damaged-brick-walkway', 'masonry'),
  ('uneven-stone-patio', 'masonry'),
  ('shifting-retaining-wall', 'masonry'),
  ('overgrown-planting-beds', 'landscaping'),
  ('landscape-cleanup', 'landscaping'),
  ('new-planting-beds', 'landscaping'),
  ('yard-surface-grading', 'landscaping'),
  ('seasonal-yard-cleanup', 'landscaping'),
  ('worn-interior-paint', 'painting'),
  ('peeling-exterior-paint', 'painting'),
  ('trim-paint-failure', 'painting'),
  ('paint-after-patching', 'painting'),
  ('hole-in-drywall', 'drywall'),
  ('drywall-crack', 'drywall'),
  ('ceiling-drywall-damage', 'drywall'),
  ('water-damaged-ceiling', 'plumbing'),
  ('water-damaged-ceiling', 'drywall'),
  ('water-damaged-ceiling', 'painting'),
  ('unfinished-drywall-repair', 'drywall'),
  ('cracked-floor-tile', 'tile'),
  ('loose-backsplash-tile', 'tile'),
  ('bathroom-floor-tile-repair', 'tile'),
  ('crumbling-grout', 'tile'),
  ('cracked-shower-tile', 'tile'),
  ('dripping-faucet', 'plumbing'),
  ('running-toilet', 'plumbing'),
  ('visible-pipe-leak', 'plumbing'),
  ('fixture-replacement', 'plumbing'),
  ('water-heater-replacement-project', 'plumbing'),
  ('failed-light-fixture', 'electrical'),
  ('dead-outlet', 'electrical'),
  ('faulty-switch', 'electrical'),
  ('ceiling-fan-project', 'electrical'),
  ('lighting-update', 'electrical'),
  ('recurring-electrical-issue', 'electrical')
on conflict (problem_id, service_id) do nothing;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000001',
  'handyman',
  'SERVICE',
  $title$Handyman repairs$title$,
  $meta$Handyman repairs for small home projects | A5$meta$,
  $metad$A5 coordinates handyman help for doors, trim, mounting, hardware, and punch-list repairs in Northern New Jersey. Regulated plumbing and electrical work stays with those trades.$metad$,
  $h1$Handyman repairs and small home projects$h1$,
  'handyman',
  $pq$What can A5 help with for handyman?$pq$,
  $da$A5 helps with small, mixed home repairs: doors that stick, loose trim, mounting, worn hardware, and punch-list items. If the work is regulated plumbing or electrical, A5 treats it as that trade instead of folding it into a handyman visit.$da$,
  $sec$[{"type":"INTRO","body":"A handyman request is usually a short list, not a single specialty. The useful question is which items are ordinary finish repairs and which ones belong with a plumber or electrician."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: sticking interior door, loose or damaged trim, wall mounting, worn door hardware, punch-list repairs, or small carpentry repair."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Adjust or repair an interior door that rubs or will not latch.","Re-secure or replace a limited run of trim or casing.","Mount a television, shelf, or curtain hardware.","Replace worn hinges, handles, or other door hardware.","Work through a punch list of small finish repairs."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You describe the list and, if you want, share photos.","A5 reviews the request and separates ordinary repairs from work that should be plumbing or electrical.","A5 then coordinates an appropriate local professional for the items that fit."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["Drywall holes, paint after a patch, and loose tile often show up on the same list. Those are related services, not automatic add-ons."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Will a handyman also do plumbing or electrical?","answer":"No. A5 does not treat regulated plumbing or electrical repairs as handyman work. Those requests are coordinated on the plumbing or electrical path."},{"question":"Can I send several small items at once?","answer":"Yes. A punch list is a normal handyman request. Describe each item so A5 can see whether they belong together."},{"question":"Do I need to know the exact trade?","answer":"No. If you are unsure, say what is happening. A5 can classify the request without you picking a specialty first."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this handyman need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '10000000-0000-4000-8000-000000000001',
  'masonry',
  'SERVICE',
  $title$Masonry repair$title$,
  $meta$Masonry repair for steps, pavers, and mortar | A5$meta$,
  $metad$A5 coordinates masonry repair for cracked brick steps, loose mortar, sunken pavers, walkways, patios, and low walls in Northern New Jersey.$metad$,
  $h1$Masonry repair for brick, stone, and pavers$h1$,
  'masonry',
  $pq$What can A5 help with for masonry?$pq$,
  $da$A5 helps homeowners with masonry that is cracking, settling, or losing mortar: brick steps, walkways, paver patios, stone repair, and low retaining walls. A5 coordinates a masonry professional; a badly moving wall may need an engineer before anyone rebuilds it.$da$,
  $sec$[{"type":"INTRO","body":"Masonry problems are usually visible. A step has cracked, a paver rocks underfoot, or the mortar between bricks is falling out. The repair depends on whether the units failed, the joints failed, or the base underneath moved."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: brick step repair, sunken pavers, loose mortar, damaged brick walkway, uneven stone patio, or shifting retaining wall."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Repair cracked or uneven brick front steps.","Reset sunken or rocking pavers on a walk or patio.","Repoint brick or stone where mortar has failed.","Repair a damaged brick walkway.","Address a low retaining wall that is separating or leaning, when the scope is a masonry repair rather than an engineering design."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You describe what moved, cracked, or became uneven, and where it is on the property.","A5 reviews whether the request is a masonry repair A5 can coordinate.","A local masonry professional then looks at the condition and discusses the repair."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["Yard grade and planting beds sometimes sit next to a failing walk or wall. That landscape work is a separate service when the homeowner wants it."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Is every cracked step a full rebuild?","answer":"Not necessarily. Some steps need joint repair or a limited reset. A5 does not decide that from a description alone; the masonry professional does after seeing the steps."},{"question":"What if a retaining wall is leaning a lot?","answer":"Significant movement can be a structural question, not only a masonry patch. A5 will not pretend a cosmetic repoint fixes a wall that needs engineering."},{"question":"Do you manufacture brick or stone?","answer":"No. A5 coordinates the repair. Matching older brick or pavers depends on what is still available, which the professional confirms on site."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this masonry need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000002',
  'landscaping',
  'SERVICE',
  $title$Landscaping$title$,
  $meta$Landscape cleanup, planting, and yard work | A5$meta$,
  $metad$A5 coordinates landscape cleanup, planting beds, seasonal yard work, and surface grading for Northern New Jersey homeowners. Not a drainage-engineering service.$metad$,
  $h1$Landscape cleanup, planting, and yard improvements$h1$,
  'landscaping',
  $pq$What can A5 help with for landscaping?$pq$,
  $da$A5 helps with landscape cleanup, overgrown beds, planting, seasonal yard work, and surface grading where water sits because the yard slopes the wrong way. A5 does not design buried drainage systems or invent landscape services outside that scope.$da$,
  $sec$[{"type":"INTRO","body":"A landscape request is about the yard as the homeowner uses it: beds that have taken over, a cleanup before a season changes, or a low spot that holds water against the house."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: overgrown planting beds, landscape cleanup, new planting beds, yard surface grading, or seasonal yard cleanup."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Clean up overgrown beds and remove debris.","Edge, prepare, and plant new beds.","Cut back and refresh beds as seasonal work.","Regrade a surface area so water moves away from a low spot."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You describe the yard condition and what you want changed.","A5 reviews whether the request is cleanup, planting, or surface grading.","A5 coordinates a local landscape professional for that scope."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["A sinking paver walk or a masonry wall at the edge of a bed is masonry work. A5 keeps those as a separate service when they are part of the same property."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Can A5 install a French drain or dry well?","answer":"Not as part of this service hub. Surface grading of a yard or bed is in scope. Buried drainage design is not something A5 is offering here."},{"question":"Is seasonal cleanup the same as a redesign?","answer":"No. Cleanup and cutbacks are maintenance. New beds and planting are a project. Say which one you want."},{"question":"Do I need a landscape plan first?","answer":"Not for a cleanup or a straightforward bed. If you want a larger redesign, describe that so A5 does not treat it as a cleanup visit."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this landscaping need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000003',
  'painting',
  'SERVICE',
  $title$Painting$title$,
  $meta$Interior and exterior house painting | A5$meta$,
  $metad$A5 coordinates interior and exterior painting for walls, ceilings, and trim in Northern New Jersey, including paint after a repair.$metad$,
  $h1$Interior and exterior painting$h1$,
  'painting',
  $pq$What can A5 help with for painting?$pq$,
  $da$A5 helps homeowners repaint walls, ceilings, and trim indoors or outside, including a finish coat after a patch. Preparation matters: peeling paint and unrepaired drywall are part of the project, not something a single coat hides.$da$,
  $sec$[{"type":"INTRO","body":"Painting requests split into two kinds. One is a room or exterior that simply needs a new coat. The other is a surface that failed, or a repair that still shows, and has to be prepared before it is painted."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: worn interior paint, peeling exterior paint, trim paint failure, paint after patching, or water-damaged ceiling."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Repaint interior walls or ceilings.","Repaint exterior siding or trim after proper preparation.","Paint window, door, and base trim.","Paint a wall or ceiling after drywall patching."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You say which rooms or exterior surfaces, and whether the paint is only worn or actually failing.","A5 reviews the request, including whether a drywall repair should happen first.","A local painting professional then coordinates the preparation and the coating."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["Open holes, cracks, and water-damaged ceilings are drywall problems first. A leak above a stain is a plumbing question. Paint is the finish after those are addressed."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Can you paint over a water stain?","answer":"Only after the leak has stopped and the ceiling is sound. Painting a wet or soft ceiling does not fix the cause. A5 will not describe stain-blocking as a leak repair."},{"question":"Do interiors and exteriors use the same process?","answer":"No. Exterior work usually needs more surface preparation where paint is peeling. Interior work is often walls, ceilings, and trim with different wear."},{"question":"Will the color match exactly?","answer":"A5 does not promise a factory match. If you have a color name or a sample, include it. The painter confirms what can be matched."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this painting need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000004',
  'drywall',
  'SERVICE',
  $title$Drywall repair$title$,
  $meta$Drywall repair for holes, cracks, and ceilings | A5$meta$,
  $metad$A5 coordinates drywall repair for holes, cracks, ceiling damage, and finishing a patch in Northern New Jersey. Water leaks are coordinated separately when needed.$metad$,
  $h1$Drywall repair and finishing$h1$,
  'drywall',
  $pq$What can A5 help with for drywall?$pq$,
  $da$A5 helps with holes, cracks, damaged ceiling drywall, and patches that were never finished. If the ceiling is wet because something leaked, the leak is a plumbing problem and the surface repair is drywall; paint comes after the patch is ready.$da$,
  $sec$[{"type":"INTRO","body":"Drywall fails in obvious ways: a hole from a doorknob, a crack at a seam, or a ceiling that stained and went soft. The repair is taping, coating, and sanding — or replacing a section when the board itself is gone."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: hole in drywall, drywall crack, ceiling drywall damage, water-damaged ceiling, or unfinished drywall repair."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Patch a hole in a wall.","Open and retape a crack that keeps returning.","Repair or replace a damaged section of ceiling drywall.","Finish a patch that was left untaped or unsanded."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You describe the damage and whether water was involved.","A5 separates an active leak from the drywall repair itself.","A local professional then patches or replaces the board and leaves it ready for paint."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["A water-damaged ceiling can need plumbing, drywall, and painting. A5 keeps those as related services so a paint-only visit is not scheduled over an open leak."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Is every crack just a coat of mud?","answer":"Hairline cracks sometimes are. Cracks that reopen, or ceilings that sag, may need the paper and tape redone or the board replaced. A5 does not decide that from a message alone."},{"question":"Will the patch be invisible before paint?","answer":"A finished patch should be smooth enough to paint. It will still show until it is painted. Painting is a separate step."},{"question":"What if the ceiling is still damp?","answer":"The leak should be stopped before the ceiling is closed up. A5 coordinates the plumbing question separately when that is what the photos or description show."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this drywall need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000005',
  'tile',
  'SERVICE',
  $title$Tile repair$title$,
  $meta$Tile repair for floors, baths, and backsplashes | A5$meta$,
  $metad$A5 coordinates tile repair for cracked floors, loose backsplash, bathroom tile, and failing grout in Northern New Jersey. Not a specialty restoration service.$metad$,
  $h1$Tile repair for floors, baths, and backsplashes$h1$,
  'tile',
  $pq$What can A5 help with for tile?$pq$,
  $da$A5 helps with cracked floor tile, loose backsplash tile, limited bathroom tile repair, and grout that is crumbling. A5 does not offer specialty historic restoration or promise that discontinued tile can be matched.$da$,
  $sec$[{"type":"INTRO","body":"Tile requests are usually local: one cracked floor tile, a backsplash piece that fell off, or grout that has washed out of a shower. The practical limit is whether a replacement piece exists and whether the surface behind a wet-area tile is still sound."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: cracked floor tile, loose backsplash tile, bathroom floor tile repair, crumbling grout, or cracked shower tile."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Replace cracked floor tiles where a match is possible.","Reset loose backsplash tile.","Repair a limited area of bathroom floor tile.","Repair crumbling grout.","Replace cracked shower tile when the homeowner wants that scoped as a repair, not a full remodel."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You describe which tiles failed and whether the area gets wet.","A5 reviews the request as a repair, not as a restoration claim.","A local tile professional confirms whether pieces can be matched and what the repair involves."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["A leaking shower valve or supply is plumbing. A5 does not treat a plumbing leak as a tile-only job."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Can you match my old tile?","answer":"Sometimes, if the tile is still made or you have spares. A5 will not promise a match for a discontinued pattern."},{"question":"Is regrouting a full waterproofing job?","answer":"No. Replacing failed grout is a repair. If the shower backing is wet or soft, that is a larger question the professional has to see."},{"question":"Do you restore antique or historic tile?","answer":"No. This service is ordinary residential tile repair, not specialty restoration."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this tile need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000006',
  'plumbing',
  'SERVICE',
  $title$Plumbing$title$,
  $meta$Plumbing repairs and fixture projects | A5$meta$,
  $metad$A5 coordinates qualified plumbing professionals for leaks, faucets, toilets, pipes, and water-heater projects in Northern New Jersey. No emergency dispatch.$metad$,
  $h1$Plumbing repairs and fixture projects$h1$,
  'plumbing',
  $pq$What can A5 help with for plumbing?$pq$,
  $da$A5 helps homeowners coordinate qualified plumbing professionals for dripping faucets, running toilets, visible leaks, fixture replacement, and planned water-heater projects. A5 does not offer emergency dispatch, and A5 staff do not perform regulated plumbing work.$da$,
  $sec$[{"type":"INTRO","body":"Plumbing requests are about water that will not stop, a fixture that failed, or a replacement the homeowner already knows they want. The first distinction is whether something is actively leaking or whether it is a scheduled repair."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: water-damaged ceiling, dripping faucet, running toilet, visible pipe leak, fixture replacement, or water heater replacement project."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Repair or replace a dripping faucet.","Repair a toilet that keeps running.","Address a visible leak at a pipe, valve, or supply line.","Replace a faucet, toilet, or similar fixture.","Coordinate a water-heater replacement as a planned project."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You describe the fixture or leak and whether water is still escaping.","A5 reviews the request and coordinates a qualified plumbing professional. A5 does not send unlicensed staff to do the plumbing.","That professional contacts you to look at the condition and discuss the repair. If you have an active emergency, use local emergency services; A5 is not an emergency plumber."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["A ceiling stain after a leak can also need drywall and paint. A5 can keep those related, but the plumbing problem is the leak itself."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Is A5 an emergency plumbing service?","answer":"No. A5 does not offer 24-hour emergency dispatch. If water is causing immediate damage, shut off the supply if you can do that safely and contact an emergency plumber or your utility."},{"question":"Who does the plumbing work?","answer":"A qualified plumbing professional coordinated for the job. A5 does not describe its own office staff as the people performing regulated plumbing."},{"question":"Can you replace a water heater this visit?","answer":"A5 can take a water-heater replacement as a project request. Timing depends on the professional and the unit. A5 does not promise an immediate visit."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this plumbing need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '20000000-0000-4000-8000-000000000007',
  'electrical',
  'SERVICE',
  $title$Electrical$title$,
  $meta$Electrical repairs, lighting, and fixtures | A5$meta$,
  $metad$A5 coordinates qualified electrical professionals for lights, outlets, switches, and ceiling fans in Northern New Jersey. No emergency electrical dispatch.$metad$,
  $h1$Electrical repairs and lighting projects$h1$,
  'electrical',
  $pq$What can A5 help with for electrical?$pq$,
  $da$A5 helps homeowners coordinate qualified electrical professionals for lights, outlets, switches, ceiling fans, and similar repair or replacement projects. A5 does not offer emergency electrical dispatch, and A5 staff do not perform regulated electrical work.$da$,
  $sec$[{"type":"INTRO","body":"Electrical requests are usually a device that failed or a fixture the homeowner wants changed. A dead outlet, a switch that sparks or sticks, and a ceiling fan are different jobs even though they share a trade."},{"type":"RICH_TEXT","heading":"Common homeowner problems","paragraphs":["Homeowners usually arrive with a specific problem: failed light fixture, dead outlet, faulty switch, ceiling fan project, lighting update, or recurring electrical issue."]},{"type":"RICH_TEXT","heading":"Projects A5 coordinates","paragraphs":["Replace a light fixture that failed or flickers.","Look at an outlet that has no power.","Replace a faulty switch.","Install or replace a ceiling fan when the box can support it.","Update lighting in a room as a planned project."]},{"type":"RICH_TEXT","heading":"How A5 works","paragraphs":["You describe the device and what it is doing, without taking apart the wiring.","A5 reviews the request and coordinates a qualified electrical professional. A5 does not send unlicensed staff to do the electrical work.","That professional inspects the condition. A5 is not an emergency electrician."]},{"type":"RICH_TEXT","heading":"Related service needs","paragraphs":["Mounting a shelf or television can be handyman work when it is not an electrical circuit. If the request includes new wiring or a dead circuit, it stays on this electrical path."]},{"type":"RICH_TEXT","heading":"Service area","paragraphs":["A5 currently coordinates projects for homeowners in Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover, New Jersey. This page is the service hub, not a town page."]},{"type":"QUESTION_ANSWER","items":[{"question":"Is A5 an emergency electrician?","answer":"No. A5 does not offer emergency electrical dispatch. If you smell burning, see sparking you cannot shut off, or have a downed line, leave the area and contact emergency services or your utility."},{"question":"Who performs the electrical work?","answer":"A qualified electrical professional coordinated for the project. A5 does not claim that unlicensed A5 personnel do regulated electrical work."},{"question":"Can any ceiling box hold a fan?","answer":"No. The professional has to confirm the box and the wiring. A5 will not promise a fan install before that is checked."}]},{"type":"CTA","title":"Get Help With a Project","description":"Tell A5 what is happening with this electrical need. A5 reviews the request and coordinates an appropriate next step."}]$sec$::jsonb,
  'REVIEW',
  false,
  true,
  'cursor-g002',
  '2026-09-27T16:00:00Z',
  '2026-09-27T16:00:00Z'
)
on conflict (id) do update set
  slug = excluded.slug,
  page_type = excluded.page_type,
  title = excluded.title,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  h1 = excluded.h1,
  primary_service_id = excluded.primary_service_id,
  primary_question = excluded.primary_question,
  direct_answer = excluded.direct_answer,
  sections = excluded.sections,
  status = excluded.status,
  indexable = excluded.indexable,
  ai_assisted = excluded.ai_assisted,
  updated_at = excluded.updated_at;

-- No content_relationships: downstream targets are not public pages yet.
