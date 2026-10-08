import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import {buildContentPathFromRecord} from '../src/lib/authority/urls.ts';
import type {ContentPageRecord} from '../src/lib/authority/types.ts';
const m=JSON.parse(readFileSync('content/growth-wave-3/manifest.json','utf8'));
test('curated growth pages satisfy publication and problem-to-service requirements',()=>{
 const paths=new Set<string>();const titles=new Set<string>();const descriptions=new Set<string>();
 for(const p of m.pages as ContentPageRecord[]){assert.deepEqual(validateForPublication({page:p,relatedServiceIds:m.problem_services.filter((r:{problem_id:string})=>r.problem_id===p.primary_problem_id).map((r:{service_id:string})=>r.service_id)}),{valid:true});const path=buildContentPathFromRecord(p);assert.ok(path);assert.ok(!paths.has(path));paths.add(path);assert.ok(!titles.has(p.title));titles.add(p.title);assert.ok(p.meta_description);assert.ok(!descriptions.has(p.meta_description));descriptions.add(p.meta_description);assert.ok(p.sections.filter(s=>s.type==='RICH_TEXT').length>=4);}
});
