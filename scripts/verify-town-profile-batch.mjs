/** Verify one published batch and persist evidence required by the next batch. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SERVICES } from '../config/services.ts';
import { MUNICIPALITIES } from '../config/locations.ts';
import { COUNTIES, countyPath } from '../config/counties.ts';
const batch = process.argv[2];
if (!/^\d{2}$/.test(batch ?? '')) throw Error('Use a two-digit batch number');
const raw = readFileSync(`content/town-profiles/batch-${batch}.manifest.json`, 'utf8');
const manifest = JSON.parse(raw);
const origin = 'https://www.a5homeservices.com';
const sitemapResponse = await fetch(origin + '/sitemap.xml');
if (!sitemapResponse.ok) throw Error('Sitemap unavailable');
const sitemap = await sitemapResponse.text();
const decode = html => html.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const rows = [], errors = [], titles = new Set(), descriptions = new Set(), countyPages = new Map();
for (const page of manifest.updates) {
  const path = '/home-services/' + page.slug;
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(30000) });
  const html = decode(await response.text());
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const problems = [];
  const title = head.match(/<title>(.*?)<\/title>/)?.[1];
  const description = head.match(/name="description" content="([^"]*)"/)?.[1];
  if (response.status !== 200) problems.push('HTTP ' + response.status);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push('H1');
  if (!title || titles.has(title)) problems.push('missing/duplicate title');
  if (!description || descriptions.has(description) || description !== page.meta_description) problems.push('description content');
  titles.add(title); descriptions.add(description);
  if (!head.includes(`rel="canonical" href="${origin + path}"`)) problems.push('canonical');
  if (!head.includes('name="robots" content="index, follow"')) problems.push('robots');
  if ((head.match(/name="description"/g) || []).length !== 1) problems.push('description count');
  if (!sitemap.includes(`<loc>${origin + path}</loc>`)) problems.push('sitemap');
  if (!html.includes(page.direct_answer)) problems.push('direct answer');
  for (const section of page.sections) {
    if (section.type === 'RICH_TEXT' && section.heading && !html.includes(section.heading)) problems.push('missing heading ' + section.heading);
  }
  for (const service of SERVICES) {
    if (!html.includes(`/request-service?service=${service.id}&location=${page.primary_location_id}`)) problems.push('missing contextual CTA ' + service.id);
  }
  const structuredData = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (!structuredData.length) problems.push('missing structured data');
  for (const script of structuredData) { try { JSON.parse(script[1]); } catch { problems.push('invalid structured data'); } }
  const town = MUNICIPALITIES.find(t => t.id === page.primary_location_id);
  const county = countyPath(COUNTIES.find(c => c.id === town.countyId));
  if (!countyPages.has(county)) {
    const r = await fetch(origin + county, { signal: AbortSignal.timeout(30000) });
    countyPages.set(county, { status: r.status, html: await r.text() });
  }
  const hub = countyPages.get(county);
  if (hub.status !== 200 || !hub.html.includes(`href="${path}"`)) problems.push('county inbound link');
  rows.push({ path, status: response.status, title, description, errors: problems });
  if (problems.length) errors.push({ path, problems });
}
const evidence = { batch, sha256: createHash('sha256').update(raw).digest('hex'), checkedAt: new Date().toISOString(), count: rows.length, sitemapCount: (sitemap.match(/<loc>/g) || []).length, errors, rows };
writeFileSync(`docs/town-profiles/batch-${batch}.live.json`, JSON.stringify(evidence, null, 2) + '\n');
console.log({ batch, count: rows.length, sitemap: evidence.sitemapCount, errors });
if (errors.length) process.exitCode = 1;
