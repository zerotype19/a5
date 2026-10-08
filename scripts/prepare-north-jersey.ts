/** Read-only: build the exact reviewed release from the saved public baseline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildNorthPlan} from '../content/north-jersey/plan.ts';
const directory='.wrangler/north-jersey';
const snapshot=JSON.parse(readFileSync(`${directory}/snapshot.json`,'utf8')) as Parameters<typeof buildNorthPlan>[0];
const plan=buildNorthPlan(snapshot);
writeFileSync(`${directory}/plan.json`,JSON.stringify(plan,null,2)+'\n');
writeFileSync('docs/north-jersey/MANIFEST.json',JSON.stringify({contentSha256:createHash('sha256').update(JSON.stringify(plan)).digest('hex'),pages:plan.manifest,existingUpdates:0,newPages:plan.inserts.length,totalAfterPublication:plan.all.length,newSources:plan.newSources.length,newRelationships:plan.relationships.length},null,2)+'\n');
console.log(`Prepared ${plan.pages.length} records; ${plan.inserts.length} new, ${0} updates.`);
