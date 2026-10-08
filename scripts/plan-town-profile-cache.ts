/** Only regenerable page HTML/RSC for this reviewed batch and its directory hubs. */
import { readFileSync, writeFileSync } from 'node:fs';
import { MUNICIPALITIES } from '../config/locations.ts';
import { COUNTIES, countyPath } from '../config/counties.ts';
const batch = process.argv[2];
if (!/^\d{2}$/.test(batch ?? '')) throw Error('Use a two-digit batch number');
const dir = `.wrangler/town-profiles/batch-${batch}`;
const manifest = JSON.parse(readFileSync(`content/town-profiles/batch-${batch}.manifest.json`, 'utf8'));
const paths = new Set<string>(['/home-services', '/services']);
for (const page of manifest.updates) {
  const town = MUNICIPALITIES.find(t => t.id === page.primary_location_id);
  if (!town || page.page_type !== 'LOCATION') throw Error('Unexpected page');
  paths.add('/home-services/' + page.slug);
  paths.add(countyPath(COUNTIES.find(c => c.id === town.countyId)!));
}
const inventory = JSON.parse(readFileSync(`${dir}/cache-keys.json`, 'utf8')) as {name:string}[];
const keys = inventory.map(k => k.name).filter(name => {
  const match = /^cache:app:v2:[^:]+:(\/[^:]*):(html|rsc)$/.exec(name);
  return match && paths.has(match[1]);
});
writeFileSync(`${dir}/cache-delete.json`, JSON.stringify(keys, null, 2) + '\n');
console.log({batch, paths:[...paths], regenerableKeys:keys.length});
