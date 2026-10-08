/** Retain test history while removing its delivery contact and assignment eligibility. */
import {writeFileSync,existsSync} from 'node:fs';
import {getSupabaseAdmin} from '../src/lib/supabase/admin.ts';
const db=getSupabaseAdmin();if(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname!=='hfzzudrukeshkzsqhwsg.supabase.co')throw Error('Wrong project');
const {data:row,error}=await db.from('vendors').select('*').eq('id','cf4076bd-7cfa-4355-9360-c706999fc168').single();if(error||row.business_name!=='A5 Owner Email Test')throw Error('Fixture identity mismatch');
if(row.email===null&&row.status==='INACTIVE'&&!row.accepting_leads){console.log({alreadyQuarantined:true});process.exit(0);}
console.log({fixtureFound:true,action:'clear delivery contact and inactivate; preserve assignments'});if(!process.argv.includes('--apply'))process.exit(0);
const path='.wrangler/growth-wave-3/fixture';if(existsSync(path+'-before.json'))throw Error('Prior run exists');writeFileSync(path+'-before.json',JSON.stringify(row),{flag:'wx',mode:0o600});
writeFileSync(path+'-receipt.json',JSON.stringify({intent:row.id}),{mode:0o600});
const r=await db.from('vendors').update({email:null,status:'INACTIVE',accepting_leads:false,discovery_notes:(row.discovery_notes??'')+'\n2026-10-08 QA: owner-only delivery fixture retired. No business email; do not assign real homeowner requests. Historical assignments retained.',updated_at:new Date().toISOString()}).eq('id',row.id).eq('updated_at',row.updated_at).select('id,status,email,accepting_leads');if(r.error||r.data.length!==1)throw Error('Concurrent change/write failure');writeFileSync(path+'-receipt.json',JSON.stringify({completed:new Date().toISOString(),result:r.data}),{mode:0o600});console.log({quarantined:true});
