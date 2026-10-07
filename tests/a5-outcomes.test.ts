import assert from "node:assert/strict";
import {describe,it} from "node:test";
import {canRecordOutcome,validateOutcome} from "../src/lib/admin/outcomes.ts";
import {processOperationsAlerts} from "../src/lib/marketing/operations-alerts.ts";

describe("Lead outcomes",()=>{
 it("permits confirmed sequential progress and prevents skipped/reopened outcomes",()=>{
  for(const [from,to] of [["ACCEPTED","CONTACTED"],["CONTACTED","ESTIMATE"],["ESTIMATE","WON"],["ACCEPTED","LOST"],["WON","WON"]] as const)assert.equal(canRecordOutcome(from,to),true);
  for(const [from,to] of [["NEW","WON"],["ASSIGNED","CONTACTED"],["ACCEPTED","WON"],["WON","CONTACTED"],["LOST","WON"]] as const)assert.equal(canRecordOutcome(from,to),false);
 });
 const base={from:"ESTIMATE" as const,to:"WON" as const,estimated:"1200.50",actual:"0",reason:"",followUp:"2026-10-10T15:00"};
 it("distinguishes unknown values from zero and clears follow-up on closure",()=>{
  assert.deepEqual(validateOutcome(base),{ok:true,estimated:1200.5,actual:0,reason:null,followUp:null});
  assert.equal(validateOutcome({...base,actual:""}).ok,true);
 });
 it("rejects negative, rounded, infinite and ambiguous monetary inputs",()=>{
  for(const value of ["-1","1.999","1e3","NaN","Infinity","1,000","10000000000"]){assert.equal(validateOutcome({...base,actual:value}).ok,false);}
 });
 it("requires a useful loss reason and validates real calendar dates",()=>{
  assert.equal(validateOutcome({...base,to:"LOST",reason:" "}).ok,false);
  assert.equal(validateOutcome({...base,to:"LOST",reason:"Homeowner deferred the project"}).ok,true);
  assert.equal(validateOutcome({...base,from:"CONTACTED",to:"ESTIMATE",followUp:"2026-02-30T12:00"}).ok,false);
 });
});

describe("Operations alert delivery",()=>{
 const env={ENABLE_OPERATIONS_ALERTS:"true",NEXT_PUBLIC_SUPABASE_URL:"https://example.supabase.co",SUPABASE_SERVICE_ROLE_KEY:"test-only",RESEND_API_KEY:"test-only",OPERATIONS_ALERT_EMAIL:"hello@example.invalid"};
 const job={id:"00000000-0000-4000-8000-000000000001",lead_id:"00000000-0000-4000-8000-000000000002",public_reference:"A5-TEST"};
 const response=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json"}});
 it("never claims or sends while disabled or misconfigured",async()=>{
  let calls=0;const request=(async()=>{calls++;throw Error("Unexpected request");}) as typeof fetch;
  assert.equal((await processOperationsAlerts({},request)).enabled,false);
  await assert.rejects(()=>processOperationsAlerts({...env,OPERATIONS_ALERT_EMAIL:""},request));assert.equal(calls,0);
 });
 it("uses a stable idempotency key and only sends the admin reference/link",async()=>{
  let patch:Record<string,unknown>={};
  const request=(async(url,init)=>{
   if(String(url).endsWith("claim_lead_notifications"))return response([job]);
   if(String(url).includes("api.resend.com")){
    assert.equal(new Headers(init?.headers).get("Idempotency-Key"),`a5-operations-${job.id}`);
    const payload=JSON.parse(String(init?.body));assert.deepEqual(payload.to,[env.OPERATIONS_ALERT_EMAIL]);assert.match(payload.text,/admin\/leads\//);assert.doesNotMatch(payload.text,/customerName|project_description|phone|photos/);return response({id:"email-test"});
   }
   patch=JSON.parse(String(init?.body));return response([{id:job.id}]);
  }) as typeof fetch;
  assert.deepEqual(await processOperationsAlerts(env,request),{enabled:true,claimed:1,sent:1,failed:0});assert.equal(patch.status,"SENT");
 });
 it("records ambiguous delivery as failed and does not retry automatically",async()=>{
  let sends=0;let patch:Record<string,unknown>={};
  const request=(async(url,init)=>{if(String(url).endsWith("claim_lead_notifications"))return response([job]);if(String(url).includes("api.resend.com")){sends++;throw Error("timeout");}patch=JSON.parse(String(init?.body));return response([{id:job.id}]);}) as typeof fetch;
  assert.equal((await processOperationsAlerts(env,request)).failed,1);assert.equal(patch.last_error,"delivery_uncertain");assert.equal(sends,1);
 });
 it("fails loudly if a successful send cannot be recorded",async()=>{
  const request=(async(url)=>String(url).endsWith("claim_lead_notifications")?response([job]):String(url).includes("api.resend.com")?response({id:"sent"}):response([])) as typeof fetch;
  await assert.rejects(()=>processOperationsAlerts(env,request),/Delivery state update failed/);
 });
});
