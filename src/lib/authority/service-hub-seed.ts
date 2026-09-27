/**
 * Render the A5-G002 non-production seed.
 * Does not publish. Does not create problem pages or service×location pages.
 */

import {
  G001_MASONRY_SERVICE_PAGE_ID,
  G002_PROBLEMS,
  SERVICE_HUBS,
} from "./service-hubs.ts";

function dollarQuote(tag: string, value: string): string {
  if (value.includes(`$${tag}$`)) {
    throw new Error(`seed tag collision: ${tag}`);
  }
  return `$${tag}$${value}$${tag}$`;
}

export function renderG002SeedSql(): string {
  const lines: string[] = [];
  lines.push(`-- A5-G002 service hubs (seed) — SEPARATE from schema migrations`);
  lines.push(`-- Status: REVIEW, indexable=false. Cursor does not publish.`);
  lines.push(`-- Problem rows are entities only. Downstream page types are not inserted.`);
  lines.push(`-- Masonry updates the existing G001 SERVICE fixture (${G001_MASONRY_SERVICE_PAGE_ID})`);
  lines.push(`-- because content_pages allows one SERVICE row per service.`);
  lines.push(`-- The other four G001 fixtures are not modified.`);
  lines.push(`-- Apply only to non-production. Owner publication is a separate decision.`);
  lines.push(``);

  for (const problem of G002_PROBLEMS) {
    if (problem.id === "brick-step-repair") {
      lines.push(`-- Existing G001 problem. Keep its row; ensure the masonry link.`);
      lines.push(`insert into public.problems (id, slug, name, description)`);
      lines.push(`values (`);
      lines.push(`  'brick-step-repair',`);
      lines.push(`  'brick-step-repair',`);
      lines.push(`  ${dollarQuote("pname", problem.name)},`);
      lines.push(`  ${dollarQuote("pdesc", problem.description)}`);
      lines.push(`)`);
      lines.push(`on conflict (id) do nothing;`);
      lines.push(``);
      continue;
    }
    lines.push(`insert into public.problems (id, slug, name, description)`);
    lines.push(`values (`);
    lines.push(`  '${problem.id}',`);
    lines.push(`  '${problem.slug}',`);
    lines.push(`  ${dollarQuote("pname", problem.name)},`);
    lines.push(`  ${dollarQuote("pdesc", problem.description)}`);
    lines.push(`)`);
    lines.push(`on conflict (id) do update set`);
    lines.push(`  slug = excluded.slug,`);
    lines.push(`  name = excluded.name,`);
    lines.push(`  description = excluded.description;`);
    lines.push(``);
  }

  lines.push(`insert into public.problem_services (problem_id, service_id)`);
  lines.push(`values`);
  const links = G002_PROBLEMS.flatMap((problem) =>
    problem.serviceIds.map(
      (serviceId) => `  ('${problem.id}', '${serviceId}')`,
    ),
  );
  lines.push(links.join(",\n"));
  lines.push(`on conflict (problem_id, service_id) do nothing;`);
  lines.push(``);

  for (const hub of SERVICE_HUBS) {
    const sections = JSON.stringify(hub.sections);
    lines.push(`insert into public.content_pages (`);
    lines.push(`  id, slug, page_type, title, meta_title, meta_description, h1,`);
    lines.push(`  primary_service_id, primary_question, direct_answer, sections,`);
    lines.push(`  status, indexable, ai_assisted, created_by, created_at, updated_at`);
    lines.push(`) values (`);
    lines.push(`  '${hub.id}',`);
    lines.push(`  '${hub.slug}',`);
    lines.push(`  'SERVICE',`);
    lines.push(`  ${dollarQuote("title", hub.title)},`);
    lines.push(`  ${dollarQuote("meta", hub.metaTitle)},`);
    lines.push(`  ${dollarQuote("metad", hub.metaDescription)},`);
    lines.push(`  ${dollarQuote("h1", hub.h1)},`);
    lines.push(`  '${hub.serviceId}',`);
    lines.push(`  ${dollarQuote("pq", hub.primaryQuestion)},`);
    lines.push(`  ${dollarQuote("da", hub.directAnswer)},`);
    lines.push(`  ${dollarQuote("sec", sections)}::jsonb,`);
    lines.push(`  'REVIEW',`);
    lines.push(`  false,`);
    lines.push(`  true,`);
    lines.push(`  'cursor-g002',`);
    lines.push(`  '2026-09-27T16:00:00Z',`);
    lines.push(`  '2026-09-27T16:00:00Z'`);
    lines.push(`)`);
    lines.push(`on conflict (id) do update set`);
    lines.push(`  slug = excluded.slug,`);
    lines.push(`  page_type = excluded.page_type,`);
    lines.push(`  title = excluded.title,`);
    lines.push(`  meta_title = excluded.meta_title,`);
    lines.push(`  meta_description = excluded.meta_description,`);
    lines.push(`  h1 = excluded.h1,`);
    lines.push(`  primary_service_id = excluded.primary_service_id,`);
    lines.push(`  primary_question = excluded.primary_question,`);
    lines.push(`  direct_answer = excluded.direct_answer,`);
    lines.push(`  sections = excluded.sections,`);
    lines.push(`  status = excluded.status,`);
    lines.push(`  indexable = excluded.indexable,`);
    lines.push(`  ai_assisted = excluded.ai_assisted,`);
    lines.push(`  updated_at = excluded.updated_at;`);
    lines.push(``);
  }

  lines.push(`-- No content_relationships: downstream targets are not public pages yet.`);
  lines.push(``);
  return lines.join("\n");
}
