/** Read-only: build the exact reviewed release from the saved public baseline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildWavePlan,type WaveSnapshot} from '../content/expansion-wave-2/plan.ts';
const directory='.wrangler/expansion-wave-2';
const snapshot=JSON.parse(readFileSync(`${directory}/snapshot.json`,'utf8')) as WaveSnapshot;
const plan=buildWavePlan(snapshot);
writeFileSync(`${directory}/plan.json`,JSON.stringify(plan,null,2)+'\n');
writeFileSync('docs/expansion-wave-2/MANIFEST.json',JSON.stringify({contentSha256:createHash('sha256').update(JSON.stringify(plan)).digest('hex'),pages:plan.manifest,existingUpdates:plan.updates.length,newPages:plan.inserts.length,totalAfterPublication:plan.all.length,newSources:plan.newSources.length,newRelationships:plan.relationships.length},null,2)+'\n');
console.log(`Prepared ${plan.pages.length} records; ${plan.inserts.length} new, ${plan.updates.length} updates.`);
