/** Read-only release audit; add --http after Worker deployment. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { getSupabaseAdmin } from '../src/lib/supabase/admin.ts';
import { readAllRows } from '../src/lib/admin/read-all.ts';
import { loadVendors } from '../src/lib/admin/vendors.ts';
import { loadWorkQueue } from '../src/lib/admin/work-queue-data.ts';
import { buildMunicipalPlan } from '../content/municipal-expansion/plan.ts';
import { MUNICIPALITIES } from '../config/locations.ts';
import { SERVICES } from '../config/services.ts';
const dir = '.wrangler/municipal-expansion';
const baseline = JSON.parse(readFileSync(`${dir}/release-before.json`, 'utf8'));
const plan = buildMunicipalPlan(baseline);
const receipt = JSON.parse(readFileSync(`${dir}/release-receipt.json`, 'utf8'));
assert.ok(receipt.completed); assert.equal(receipt.intent, null);
const db = getSupabaseAdmin();
const vendors = await loadVendors();
const pages = await readAllRows((from, to) => db.from('content_pages').select('*').order('id').range(from, to), 'pages');
const rawVendors = await readAllRows((from, to) => db.from('vendors').select('*').order('id').range(from, to), 'vendors');
const contactIds = new Set(receipt.writes.filter((w: {type: string}) => w.type === 'contact').map((w: {id: string}) => w.id));
for (const before of baseline.vendors) {
 const after = rawVendors.find(v => v.id === before.id)!;
 assert.ok(after);
 for (const key of Object.keys(before)) if (!(contactIds.has(before.id) && ['email', 'discovery_notes', 'updated_at'].includes(key))) assert.deepEqual(after[key], before[key], `Existing vendor field changed: ${key}`);
 if (contactIds.has(before.id)) assert.ok(after.email && after.discovery_notes.includes('Contact confirmation pending.'));
}
for (const before of baseline.content_pages) assert.deepEqual(pages.find(p => p.id === before.id), before);
const rows = JSON.parse(readFileSync(`${dir}/vendor-plan.json`, 'utf8')) as {businessName: string; serviceIds: string[]; locationIds: string[]}[];
for (const row of rows) {
 const vendor = vendors.find(v => v.businessName === row.businessName)!;
 assert.ok(vendor); assert.equal(vendor.status, 'DISCOVERED'); assert.equal(vendor.acceptingLeads, false);
 assert.deepEqual([...vendor.serviceIds].sort(), [...row.serviceIds].sort());
 assert.deepEqual([...vendor.locationIds].sort(), [...row.locationIds].sort());
}
for (const p of plan.pages) {
 const actual = pages.find(row => row.id === p.id)!;
 assert.ok(actual); assert.equal(actual.status, 'PUBLISHED'); assert.equal(actual.indexable, false); assert.deepEqual(actual.sections, p.sections);
}
for (const town of MUNICIPALITIES) assert.ok(pages.some(p => p.page_type === 'LOCATION' && p.primary_location_id === town.id && p.status === 'PUBLISHED'));
const queue = await loadWorkQueue();
const result = { checkedAt: new Date().toISOString(), publishedPages: pages.filter(p => p.status === 'PUBLISHED').length, newPages: plan.pages.length, municipalityProfiles: MUNICIPALITIES.length, vendors: vendors.length, importedCandidates: rows.length, newServiceMappings: rows.reduce((n,r)=>n+r.serviceIds.length,0), newLocationMappings: rows.reduce((n,r)=>n+r.locationIds.length,0), enrichedContacts: contactIds.size, queueRequests: queue.requests.length, queueVendorTasks: queue.vendors.length, httpRoutes: 0, sitemapUrls: 0 };
if (process.argv.includes('--http')) {
 const origin = 'https://www.a5homeservices.com';
 const sitemap = await fetch(`${origin}/sitemap.xml`).then(r=>r.text());
 result.sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].length;
 assert.equal(result.sitemapUrls, 75);
 let cursor = 0;
 await Promise.all(Array.from({length: 5}, async()=>{
  while (cursor < plan.pages.length) {
   const page = plan.pages[cursor++];
   const path = `/home-services/${page.slug}`;
   const response = await fetch(`${origin}${path}`);
   assert.equal(response.status, 200, path);
   const html = await response.text();
   assert.ok(html.includes('noindex'), `robots ${path}`);
   assert.ok(html.includes(`href="${origin}${path}"`), `canonical ${path}`);
   assert.ok(!sitemap.includes(`${origin}${path}</loc>`), `sitemap ${path}`);
   for (const service of SERVICES) assert.ok(html.includes(`service=${service.id}&amp;location=${page.primary_location_id}`), `context ${path} ${service.id}`);
   result.httpRoutes++;
  }
 }));
 const directory = await fetch(`${origin}/home-services`).then(r=>r.text());
 for (const town of MUNICIPALITIES) assert.ok(directory.includes(`/home-services/${town.slug}`), `Directory link ${town.id}`);
 const unauth = await fetch(`${origin}/admin/queue`, {redirect:'manual'});
 assert.ok([302,303,307,308].includes(unauth.status)); assert.ok(unauth.headers.get('location')?.includes('/admin/login'));
}
writeFileSync(`${dir}/verification.json`, JSON.stringify(result,null,2));
console.log(result);
