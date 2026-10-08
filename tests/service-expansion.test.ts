import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXPANSION_SERVICES,SERVICES} from '../config/services.ts';
import {validateForPublication} from '../src/lib/authority/validate.ts';
import {validateSignup} from '../src/lib/vendor-signup/validation.ts';
import {validateSubmissionPayload} from '../src/lib/intake/validate-submission.ts';
import type {ContentPageRecord} from '../src/lib/authority/types.ts';
const pages=JSON.parse(readFileSync(new URL('../content/service-expansion/pages.json',import.meta.url),'utf8')) as ContentPageRecord[];
describe('owner-authorized service expansion',()=>{
 it('has one publishable authored hub and an additive DB seed for every new service',()=>{
  const sql=readFileSync(new URL('../supabase/migrations/20261008070000_service_expansion.sql',import.meta.url),'utf8');
  assert.equal(pages.length,8);assert.equal(new Set(SERVICES.map(s=>s.id)).size,16);
  for(const s of EXPANSION_SERVICES){const p=pages.find(p=>p.primary_service_id===s.id);assert.ok(p);assert.equal(p.slug,s.slug);assert.deepEqual(validateForPublication({page:p}),{valid:true});assert.ok(sql.includes(`('${s.id}', '${s.name}', '${s.slug}')`));assert.ok(p.sections.some(section=>section.type==='CTA'));assert.equal(p.sections.filter(section=>section.type==='RICH_TEXT').length,3);assert.ok(readFileSync(new URL(`../public/images/${s.id}.svg`,import.meta.url),'utf8').includes('viewBox="0 0 1440 960"'));}
 });
 it('accepts every new category in homeowner intake and vendor signup',()=>{
  for(const s of EXPANSION_SERVICES){assert.equal(validateSubmissionPayload({serviceId:s.id,serviceSelectionStatus:'SELECTED',zip:'07940',description:'Please help with a planned project at our home.',timing:'WITHIN_30_DAYS',firstName:'Test',lastName:'Owner',phone:'9735551212',email:'test@example.com',preferredContact:'PHONE',turnstileToken:null}).ok,true,s.id);assert.equal(validateSignup({businessName:'Test Business',contactName:'Test Person',email:'test@example.invalid',phone:'',website:'example.com',serviceIds:[s.id],locationIds:['madison'],notes:'',consent:true}).ok,true,s.id);}
 });
});
