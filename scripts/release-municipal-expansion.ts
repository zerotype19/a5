/** Exact-manifest release. Default is read-only; --apply performs owner-authorized writes. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from '../src/lib/supabase/admin.ts';
import { readAllRows } from '../src/lib/admin/read-all.ts';
import { parseVendorCandidateCsv } from '../src/lib/admin/vendor-import.ts';
import { buildMunicipalPlan } from '../content/municipal-expansion/plan.ts';
const dir = '.wrangler/municipal-expansion';
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const hash = (value: unknown) => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const db = getSupabaseAdmin();
if (new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname !== 'hfzzudrukeshkzsqhwsg.supabase.co') throw Error('Wrong project');
const baseline = read(`${dir}/baseline.json`);
const plan = buildMunicipalPlan(baseline);
const csv = readFileSync('docs/municipal-expansion/VENDOR-IMPORT.csv', 'utf8');
if (hash(plan) !== read('docs/municipal-expansion/CONTENT-MANIFEST.json').sha256 || hash(csv) !== read('docs/municipal-expansion/VENDOR-MANIFEST.json').sha256) throw Error('Manifest mismatch');
const tables = ['vendors', 'vendor_services', 'vendor_locations', 'content_pages', 'sources', 'content_sources', 'content_relationships'];
const snapshot: Record<string, Record<string, unknown>[]> = {};
for (const table of tables) {
 const order = table === 'vendor_services' ? ['vendor_id', 'service_id'] : table === 'vendor_locations' ? ['vendor_id', 'location_id'] : table === 'content_sources' ? ['content_page_id', 'source_id'] : table === 'content_relationships' ? ['from_page_id', 'to_page_id'] : ['id'];
 snapshot[table] = await readAllRows((from, to) => { let query = db.from(table).select('*'); for (const key of order) query = query.order(key); return query.range(from, to); }, table);
}
const normalize = (value: unknown) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const domain = (value: unknown) => value ? new URL(String(value)).hostname.replace(/^www\./, '') : '';
const phone = (value: unknown) => String(value ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const parsed = parseVendorCandidateCsv(csv, snapshot.vendors.map(v => String(v.business_name)));
if (parsed.fileError || parsed.rejected.length || parsed.rows.length !== 23) throw Error('Vendor parser rejected reviewed batch');
for (const v of parsed.rows) {
 if (snapshot.vendors.some(o => normalize(o.business_name) === normalize(v.businessName) || domain(o.website) === domain(v.website) || phone(o.phone) && phone(o.phone) === phone(v.phone) || o.email && v.email && String(o.email).toLowerCase() === v.email.toLowerCase())) throw Error(`Duplicate: ${v.businessName}`);
}
for (const p of plan.pages) if (snapshot.content_pages.some(o => o.id === p.id || o.slug === p.slug)) throw Error(`Existing page: ${p.slug}`);
for (const before of baseline.content_pages) {
 const current = snapshot.content_pages.find(p => p.id === before.id);
 if (!current || current.updated_at !== before.updated_at) throw Error('Existing content changed; rebuild/review manifest');
}
const updates = read('docs/municipal-expansion/CONTACT-ENRICHMENT.json').updates as { business_name: string; email: string; source_url: string; observed_date: string; review_note: string }[];
const contacts = updates.map(update => {
 const row = snapshot.vendors.find(v => v.business_name === update.business_name);
 if (!row || row.email) throw Error(`Contact no longer blank: ${update.business_name}`);
 const notes = `${row.discovery_notes ?? ''}\nContact confirmation pending. Public contact reviewed ${update.observed_date}: ${update.source_url}. ${update.review_note}`.trim();
 return { row, update, notes };
});
const operators = await db.from('admin_users').select('user_id').eq('active', true);
if (operators.error || operators.data?.length !== 1) throw Error('Resolve authorized operator before release');
console.log({ preflight: 'passed', pages: plan.pages.length, candidates: parsed.rows.length, contacts: contacts.length, sourceLinks: plan.sourceLinks.length, relationships: plan.relationships.length });
if (!process.argv.includes('--apply')) process.exit(0);
if (existsSync(`${dir}/release-before.json`) || existsSync(`${dir}/release-receipt.json`)) throw Error('Prior release evidence exists; inspect and resume manually, never repeat blindly');
writeFileSync(`${dir}/release-before.json`, JSON.stringify(snapshot, null, 2), { flag: 'wx', mode: 0o600 });
const receipt: { started: string; completed?: string; writes: unknown[]; intent: unknown } = { started: new Date().toISOString(), writes: [], intent: null };
const save = () => writeFileSync(`${dir}/release-receipt.json`, JSON.stringify(receipt, null, 2), { mode: 0o600 });
const intent = (value: unknown) => { receipt.intent = value; save(); };
const done = (value: unknown) => { receipt.writes.push(value); receipt.intent = null; save(); };
for (const row of parsed.rows) {
 intent({ type: 'vendor', business: row.businessName });
 const { data, error } = await db.rpc('admin_upsert_vendor', {
 p_vendor_id: null, p_business_name: row.businessName, p_contact_name: row.contactName || null,
 p_phone: row.phone || null, p_email: row.email || null, p_website: row.website || null,
 p_source: row.source, p_source_url: row.sourceUrl, p_discovery_notes: row.discoveryNotes,
 p_status: 'DISCOVERED', p_accepting_leads: false, p_registration_number: null, p_license_number: null,
 p_insurance_verified: false, p_credentials_notes: null, p_service_ids: row.serviceIds,
 p_location_ids: row.locationIds, p_actor_user_id: operators.data[0].user_id,
 });
 const result = Array.isArray(data) ? data[0] : data;
 if (error || !result?.ok || !result.vendor_id) throw Error(`Vendor write failed: ${row.businessName} ${error?.code ?? result?.error_code}`);
 done({ type: 'vendor', business: row.businessName, id: result.vendor_id });
}
for (const { row, update, notes } of contacts) {
 intent({ type: 'contact', id: row.id });
 const { data, error } = await db.from('vendors').update({ email: update.email, discovery_notes: notes, updated_at: new Date().toISOString() }).eq('id', row.id).is('email', null).eq('updated_at', row.updated_at).select('id,updated_at');
 if (error || data?.length !== 1) throw Error(`Contact concurrent change/write failure: ${update.business_name}`);
 done({ type: 'contact', ...data[0] });
}
const stamp = new Date().toISOString();
for (let i = 0; i < plan.pages.length; i += 50) {
 const batch = plan.pages.slice(i, i + 50).map(p => ({ ...p, created_at: stamp, updated_at: stamp }));
 intent({ type: 'drafts', ids: batch.map(p => p.id) });
 const { data, error } = await db.from('content_pages').insert(batch).select('id,updated_at');
 if (error || data?.length !== batch.length) throw Error(`Draft insert failed: ${error?.code}`);
 done({ type: 'drafts', rows: data });
}
for (const [table, rows] of [['content_sources', plan.sourceLinks], ['content_relationships', plan.relationships]] as const) {
 for (let i = 0; i < rows.length; i += 200) {
  const batch = rows.slice(i, i + 200);
  intent({ type: table, offset: i, count: batch.length });
  const { error } = await db.from(table).insert(batch as Record<string, unknown>[]);
  if (error) throw Error(`${table}: ${error.code}`);
  done({ type: table, offset: i, count: batch.length });
 }
}
for (const page of plan.pages) {
 intent({ type: 'publish', id: page.id });
 const now = new Date().toISOString();
 const { data, error } = await db.from('content_pages').update({ status: 'PUBLISHED', indexable: false, reviewed_by: 'Codex / owner-authorized municipal directory publication', reviewed_at: now, last_reviewed_at: now, published_at: now, updated_at: now }).eq('id', page.id).eq('status', 'DRAFT').eq('updated_at', stamp).select('id,updated_at');
 if (error || data?.length !== 1) throw Error(`Publish concurrent change/write failure: ${page.slug} ${error?.code}`);
 done({ type: 'publish', ...data[0] });
}
receipt.completed = new Date().toISOString(); save();
console.log({ completed: receipt.completed, writes: receipt.writes.length });
