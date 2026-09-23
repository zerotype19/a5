-- A5-G001 proof fixtures (seed) — SEPARATE from schema migration
-- Status: DRAFT, indexable=false for all pages
-- Max proof set: 1 service, 1 location, 1 service×location, 1 problem, 1 guide
-- DO NOT treat as published content. Owner approval required to publish.
-- Apply only to non-production after schema migration.

-- Problem entity
insert into public.problems (id, slug, name, description, created_at)
values (
  'brick-step-repair',
  'brick-step-repair',
  'Brick Step Repair',
  'Brick front steps that are cracking, shifting, crumbling, or becoming uneven — a common masonry concern for Northern New Jersey homeowners.',
  '2026-09-23T18:00:00Z'
)
on conflict (id) do nothing;

insert into public.problem_services (problem_id, service_id)
values ('brick-step-repair', 'masonry')
on conflict do nothing;

-- Source (industry background — not fabricated A5 research)
insert into public.sources (
  id, title, url, publisher, source_type, retrieved_at, reviewed_at, created_at
) values (
  '00000000-0000-4000-8000-000000000001',
  'Brick masonry maintenance overview (industry reference)',
  'https://www.bia.org/',
  'Brick Industry Association',
  'INDUSTRY',
  '2026-09-23T18:00:00Z',
  '2026-09-23T18:00:00Z',
  '2026-09-23T18:00:00Z'
)
on conflict (id) do nothing;

-- SERVICE — Masonry (DRAFT)
insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '10000000-0000-4000-8000-000000000001',
  'masonry',
  'SERVICE',
  'Masonry',
  'Masonry Services | A5 Home Services',
  'A5 coordinates masonry projects for homeowners in Northern New Jersey — brick steps, walkways, walls, and related repairs.',
  'Masonry',
  'masonry',
  'Who can help with masonry projects near me?',
  'A5 Home Services coordinates masonry projects for homeowners in Madison, Florham Park, Chatham, Morristown, Morris Township, and East Hanover.',
  '[
    {"type":"INTRO","body":"A5 coordinates masonry projects for homeowners across our approved Northern New Jersey communities — from small brick repairs to larger rebuilds."},
    {"type":"RICH_TEXT","heading":"Problems A5 can help coordinate","paragraphs":["Homeowners often contact A5 about cracked brick steps, failing mortar joints, settling walkways, and damaged retaining walls.","A5 reviews the request and coordinates an appropriate local masonry professional — A5 does not invent a diagnosis from photos or symptoms alone."]},
    {"type":"QUESTION_ANSWER","items":[{"question":"Does A5 perform masonry work with in-house crews?","answer":"A5 is a home-services contractor and project-coordination company. After intake, A5 connects the homeowner with an appropriate local professional for the work."}]},
    {"type":"RELATED_CONTENT"},
    {"type":"CTA","title":"Need help with a masonry project?","description":"Tell A5 what is happening at your home. We will review the request and coordinate next steps."}
  ]'::jsonb,
  'DRAFT',
  false,
  true,
  'cursor-g001',
  '2026-09-23T18:00:00Z',
  '2026-09-23T18:00:00Z'
)
on conflict (id) do nothing;

-- LOCATION — Madison (DRAFT)
insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_location_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '10000000-0000-4000-8000-000000000002',
  'madison',
  'LOCATION',
  'Home Services in Madison, NJ',
  'Home Services in Madison, NJ | A5 Home Services',
  'A5 coordinates home-service projects for Madison, New Jersey homeowners across approved trades.',
  'Home Services in Madison, NJ',
  'madison',
  'Does A5 serve Madison, NJ?',
  'Yes. Madison is one of A5''s approved Northern New Jersey service locations.',
  '[
    {"type":"INTRO","body":"A5 Home Services coordinates approved home-service projects for Madison, NJ homeowners — including masonry, handyman work, landscaping, painting, drywall, tile, plumbing, and electrical."},
    {"type":"RICH_TEXT","heading":"How A5 works in Madison","paragraphs":["Submit a project request with what you need and where the work is. A5 reviews the request and coordinates an appropriate local professional.","This page is a draft architecture fixture for G001 — it does not invent local observations or claim completed Madison projects."]},
    {"type":"RELATED_CONTENT"},
    {"type":"CTA","title":"Request service in Madison","description":"Describe the project. A5 will review and coordinate next steps."}
  ]'::jsonb,
  'DRAFT',
  false,
  true,
  'cursor-g001',
  '2026-09-23T18:00:00Z',
  '2026-09-23T18:00:00Z'
)
on conflict (id) do nothing;

-- SERVICE_LOCATION — Madison × Masonry (DRAFT)
insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_location_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '10000000-0000-4000-8000-000000000003',
  'madison-masonry',
  'SERVICE_LOCATION',
  'Masonry in Madison, NJ',
  'Masonry in Madison, NJ | A5 Home Services',
  'A5 coordinates masonry projects for Madison, New Jersey homeowners — brick steps, walkways, and related repairs.',
  'Masonry in Madison, NJ',
  'masonry',
  'madison',
  'Can A5 help with masonry in Madison, NJ?',
  'Yes. A5 coordinates masonry projects for Madison homeowners and connects them with an appropriate local professional after intake review.',
  '[
    {"type":"INTRO","body":"A5 coordinates masonry projects for Madison, NJ homeowners — including brick step concerns, walkway repairs, and related masonry work — with local context rather than a town-name swap."},
    {"type":"DIRECT_ANSWER","body":"Madison homeowners can request masonry help through A5. A5 reviews the project and coordinates an appropriate local professional serving Madison and nearby Morris County communities."},
    {"type":"RICH_TEXT","heading":"Local masonry context (draft fixture)","paragraphs":["Older Madison neighborhoods often include brick stoops and masonry walkways that see freeze-thaw cycles each winter. When steps crack or settle, homeowners typically want clarity on repair versus rebuild before committing to work.","This draft fixture exists to prove service×location architecture. It does not claim completed A5 projects in Madison and must not be published without owner review and differentiated evidence."]},
    {"type":"RELATED_CONTENT"},
    {"type":"CTA","title":"Request masonry help in Madison","description":"Share photos and a short description of what you are seeing."}
  ]'::jsonb,
  'DRAFT',
  false,
  true,
  'cursor-g001',
  '2026-09-23T18:00:00Z',
  '2026-09-23T18:00:00Z'
)
on conflict (id) do nothing;

-- PROBLEM — Brick Step Repair (DRAFT)
insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_problem_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '10000000-0000-4000-8000-000000000004',
  'brick-step-repair',
  'PROBLEM',
  'Brick Step Repair',
  'Brick Step Repair | A5 Home Services',
  'What cracked or settling brick steps can mean for homeowners — and how A5 coordinates masonry help in Northern New Jersey.',
  'Brick Step Repair',
  'masonry',
  'brick-step-repair',
  'Why are my brick steps cracking?',
  'Brick steps often crack due to settlement, freeze-thaw, or failing mortar. A5 can coordinate a masonry professional to inspect options — not diagnose remotely.',
  '[
    {"type":"DIRECT_ANSWER","body":"Brick steps crack for several common reasons — settlement, freeze-thaw, failing mortar, or impact. A5 can coordinate a masonry professional to inspect and discuss repair versus rebuild options. This is not a remote diagnosis."},
    {"type":"RICH_TEXT","heading":"What the problem looks like","paragraphs":["Homeowners often notice hairline cracks in treads, crumbling mortar joints, uneven risers, loose bricks, or steps that tilt away from the house.","Photos help A5''s intake review, but only an on-site professional can determine the right repair approach."]},
    {"type":"RICH_TEXT","heading":"Common causes","paragraphs":["Soil settlement, water intrusion, freeze-thaw cycles common in Northern New Jersey winters, deteriorating mortar, and age-related wear."]},
    {"type":"RICH_TEXT","heading":"Repair vs replacement","paragraphs":["Minor mortar and brick replacement may be enough when the structure is sound. Extensive settlement or failed foundations often call for rebuild. A5 does not present a one-size answer from a web form."]},
    {"type":"QUESTION_ANSWER","items":[{"question":"Is a cracked brick step always an emergency?","answer":"Not always, but uneven or loose steps can be a trip hazard. If steps feel unstable, limit use and request a professional assessment."}]},
    {"type":"SOURCE_LIST"},
    {"type":"RELATED_CONTENT"},
    {"type":"CTA","title":"Get help with brick step concerns","description":"Request service and share what you are seeing at home."}
  ]'::jsonb,
  'DRAFT',
  false,
  true,
  'cursor-g001',
  '2026-09-23T18:00:00Z',
  '2026-09-23T18:00:00Z'
)
on conflict (id) do nothing;

-- GUIDE — Why Brick Steps Crack (DRAFT)
insert into public.content_pages (
  id, slug, page_type, title, meta_title, meta_description, h1,
  primary_service_id, primary_problem_id, primary_question, direct_answer, sections,
  status, indexable, ai_assisted, created_by, created_at, updated_at
) values (
  '10000000-0000-4000-8000-000000000005',
  'why-brick-steps-crack',
  'GUIDE',
  'Why Brick Steps Crack',
  'Why Brick Steps Crack | A5 Home Services',
  'A practical guide for Northern New Jersey homeowners on why brick steps crack and when to request professional help.',
  'Why Brick Steps Crack',
  'masonry',
  'brick-step-repair',
  'Why do brick steps crack?',
  'Movement, moisture, freeze-thaw, and aging mortar are common causes. Visible symptoms help prioritize inspection; they do not replace an on-site assessment.',
  '[
    {"type":"DIRECT_ANSWER","body":"Brick steps crack when movement, moisture, freeze-thaw, or aging mortar exceeds what the assembly can tolerate. Homeowners can safely note visible cracks and trip hazards; structural conclusions require an on-site professional."},
    {"type":"RICH_TEXT","heading":"What homeowners can inspect safely","paragraphs":["From a safe standing position, note crack location, whether steps feel loose, and whether water pools near the base. Do not dig out joints or pry bricks."]},
    {"type":"RICH_TEXT","heading":"When professional help may make sense","paragraphs":["If steps are uneven, bricks are loose, or cracks are widening, request a professional assessment. A5 can coordinate masonry help after intake."]},
    {"type":"SOURCE_LIST"},
    {"type":"RELATED_CONTENT"},
    {"type":"CTA","title":"Talk to A5 about brick steps","description":"Share a short description and optional photos."}
  ]'::jsonb,
  'DRAFT',
  false,
  true,
  'cursor-g001',
  '2026-09-23T18:00:00Z',
  '2026-09-23T18:00:00Z'
)
on conflict (id) do nothing;

-- Source links
insert into public.content_sources (content_page_id, source_id, relationship_type)
values
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'BACKGROUND'),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'BACKGROUND')
on conflict do nothing;

-- Explicit relationships (draft graph — public rendering filters to PUBLISHED targets)
insert into public.content_relationships (from_page_id, to_page_id, relationship_type)
values
  ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', 'RELATED'),
  ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', 'SUPPORTING_GUIDE'),
  ('10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 'LOCAL_VARIANT'),
  ('10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', 'RELATED'),
  ('10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000005', 'SUPPORTING_GUIDE'),
  ('10000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004', 'RELATED')
on conflict do nothing;
