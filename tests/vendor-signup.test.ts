import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {validateSignup,setCountyCoverage} from '../src/lib/vendor-signup/validation.ts';
import {submitVendorSignup} from '../src/lib/vendor-signup/submit.ts';
import {MUNICIPALITIES,LOCATIONS} from '../config/locations.ts';
const town=MUNICIPALITIES[0];
const input={businessName:'Test Business',contactName:'Test Person',email:'test@example.invalid',phone:'',website:'example.com',serviceIds:['painting'],locationIds:[town.id],notes:'Interior work',consent:true};
const key='00000000-0000-4000-8000-000000000001';
describe('vendor signup validation and coverage',()=>{
 it('normalizes emails/URLs and allows optional contact fields',()=>{const result=validateSignup({...input,email:' TEST@example.invalid '});assert.equal(result.ok,true);if(result.ok){assert.equal(result.data.email,'test@example.invalid');assert.equal(result.data.website,'https://example.com');assert.equal(result.data.phone,'');}});
 it('requires business, representative, email, services, towns and permission',()=>{const result=validateSignup({...input,businessName:'',contactName:'',email:'',serviceIds:[],locationIds:[],consent:false});assert.equal(result.ok,false);if(!result.ok)assert.deepEqual(Object.keys(result.errors).sort(),['businessName','contactName','email','serviceIds','locationIds','consent'].sort());});
 it('rejects unregistered services, unknown towns and historical aggregate areas',()=>{assert.equal(validateSignup({...input,serviceIds:['roofing']}).ok,false);assert.equal(validateSignup({...input,locationIds:['unknown']}).ok,false);const legacy=LOCATIONS.find(t=>t.legacyArea);if(legacy)assert.equal(validateSignup({...input,locationIds:[legacy.id]}).ok,false);});
 it('rejects malformed data, oversized notes, unusable emails and unsafe websites',()=>{for(const changed of [{notes:'x'.repeat(2001)},{email:'x@'},{website:'javascript:alert(1)'},{website:'https://user:pass@example.com'},{phone:'123'},{serviceIds:'painting'},{locationIds:[null]},{contactName:5},{consent:'true'}])assert.equal(validateSignup({...input,...changed}).ok,false);assert.equal(validateSignup(null).ok,false);});
 it('county selection stores unique municipality IDs and preserves other counties',()=>{const other=MUNICIPALITIES.find(t=>t.countyId!==town.countyId)!;const selected=setCountyCoverage([other.id],town.countyId,true);const expected=MUNICIPALITIES.filter(t=>t.countyId===town.countyId);assert.equal(selected.length,expected.length+1);assert.deepEqual(setCountyCoverage(selected,town.countyId,true),selected);assert.deepEqual(setCountyCoverage(selected,town.countyId,false),[other.id]);});
});
describe('vendor signup boundary',()=>{
 it('fails closed while disabled without calling security or persistence',async()=>{const result=await submitVendorSignup(input,key,{enabled:()=>false,verify:async()=>{throw Error('called');},save:async()=>{throw Error('called');}});assert.equal(result.status,503);});
 it('rejects malformed key/input/honeypot before storage',async()=>{let calls=0;const deps={enabled:()=>true,verify:async()=>({ok:true as const}),save:async()=>{calls++;return{ok:true};}};for(const [payload,k] of [[input,'bad'],[{...input,email:''},key],[{...input,companyFax:'spam'},key]] as const){const r=await submitVendorSignup(payload,k,deps);assert.equal(r.status,400);}assert.equal(calls,0);});
 it('security failure cannot create a signup',async()=>{const result=await submitVendorSignup(input,key,{enabled:()=>true,verify:async()=>({ok:false,reason:'rejected'}),save:async()=>{throw Error('called');}});assert.equal(result.status,403);});
 it('saves only validated fields, not status, credentials, actor or token',async()=>{let saved:unknown;const result=await submitVendorSignup({...input,status:'ACTIVE',insuranceVerified:true,turnstileToken:'private-token'},key,{enabled:()=>true,verify:async()=>({ok:true}),save:async(k,p)=>{assert.equal(k,key);saved=p;return{ok:true};}});assert.equal(result.status,200);assert.deepEqual(saved,validateSignup(input).ok?{...input,website:'https://example.com'}:null);});
 it('returns actionable conflict, throttle and failure responses without internals',async()=>{for(const [code,status] of [['key_conflict',409],['rate_limited',429],['internal-secret',503]] as const){const result=await submitVendorSignup(input,key,{enabled:()=>true,verify:async()=>({ok:true}),save:async()=>({ok:false,code})});assert.equal(result.status,status);assert.ok(!JSON.stringify(result.body).includes('internal-secret'));}});
});

describe('vendor signup HTTP boundary',()=>{
 it('accepts the actual Host behind Next dev/proxy URLs and rejects cross-origin calls',async()=>{
  const {handleVendorSignupRequest}=await import('../src/lib/vendor-signup/http.ts');let called=0;
  const save=async()=>{called++;return{status:200,body:{success:true}};};
  const request=(origin:string)=>new Request('http://localhost:43123/api/vendor-signup',{method:'POST',headers:{'content-type':'application/json',host:'127.0.0.1:43123',origin},body:'{}'});
  assert.equal((await handleVendorSignupRequest(request('http://127.0.0.1:43123'),save)).status,200);
  assert.equal((await handleVendorSignupRequest(request('https://other.example'),save)).status,403);
  assert.equal((await handleVendorSignupRequest(request('null'),save)).status,403);
  assert.equal(called,1);
 });
 it('rejects malformed JSON, wrong content types, and oversized streamed bodies before saving',async()=>{
  const {handleVendorSignupRequest}=await import('../src/lib/vendor-signup/http.ts');let called=0;
  const save=async()=>{called++;return{status:200,body:{success:true}};};
  for(const [body,type,status] of [['{','application/json',400],['{}','text/plain',415],['x'.repeat(32769),'application/json',413]] as const){
   const r=await handleVendorSignupRequest(new Request('https://www.a5homeservices.com/api/vendor-signup',{method:'POST',headers:{'content-type':type},body}),save);assert.equal(r.status,status);assert.equal(r.headers.get('cache-control'),'no-store');
  }assert.equal(called,0);
 });
});
