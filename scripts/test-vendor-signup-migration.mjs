/** Isolated PostgreSQL integration: no Supabase or production connections. */
import {execFileSync,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const bin=execFileSync('pg_config',['--bindir'],{encoding:'utf8'}).trim();
const dir=mkdtempSync(join(tmpdir(),'a5-signup-db-')),port='54391';
const sql=text=>execFileSync(join(bin,'psql'),['-h',dir,'-p',port,'-d','postgres','-v','ON_ERROR_STOP=1','-At'],{input:text,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const actor='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000099';
let n=10;
const key=()=>`00000000-0000-4000-8000-${String(n++).padStart(12,'0')}`;
const base={businessName:'Test Business',contactName:'Test Contact',email:'test@example.invalid',phone:'',website:'https://example.invalid',notes:'Only interior work',serviceIds:['painting','tile'],locationIds:['town-a','town-b'],consent:true};
const quote=s=>`'${s.replaceAll("'","''")}'`;
const submit=(k,p=base)=>`select * from public.submit_vendor_signup('${k}',${quote(JSON.stringify(p))}::jsonb,'2026-10-08');`;
const review=(id,action='create',vendor=null,who=actor)=>`select * from public.admin_review_vendor_signup('${id}','${action}',${vendor?`'${vendor}'`:'null'},'${who}','Reviewed in test');`;
const expect=(q,value)=>assert.equal(sql(q),value);
const denied=q=>{let failed=false;try{sql(q);}catch{failed=true;}assert.ok(failed,'Expected access/constraint failure');};
try{
 execFileSync(join(bin,'initdb'),['-D',join(dir,'data'),'-A','trust','--no-locale'],{stdio:'ignore'});
 execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'-l',join(dir,'log'),'-o',`-k ${dir} -p ${port} -c listen_addresses=''`,'start'],{stdio:'ignore'});
 sql(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${actor}');create table public.admin_users(user_id uuid primary key references auth.users(id),active boolean);insert into public.admin_users values('${actor}',true);create table public.services(id text primary key);create table public.locations(id text primary key);insert into services values('painting'),('tile');insert into locations values('town-a'),('town-b');`);
 const vendorMigration=readFileSync(new URL('../supabase/migrations/20260923210000_a5_008_vendor_assignment.sql',import.meta.url),'utf8');
 sql(vendorMigration.slice(vendorMigration.indexOf('create type public.vendor_status'),vendorMigration.indexOf('-- assignments\n')));
 sql(readFileSync(new URL('../supabase/migrations/20261008030000_vendor_signup.sql',import.meta.url),'utf8'));
 const first=key();expect(submit(first),'t|');expect(submit(first),'t|');expect('select count(*) from vendor_signups','1');
 expect(submit(first,{...base,notes:'Changed'}),'f|key_conflict');
 expect(submit(key(),{...base,serviceIds:['bad']}),'f|invalid_coverage');expect(submit(key(),{...base,email:''}),'f|invalid_input');expect(submit(key(),{...base,consent:false}),'f|invalid_input');expect(submit(key(),{...base,serviceIds:[]}),'f|invalid_coverage');
 const id=sql('select id from vendor_signups');
 expect(review(id,'create',null,other),'f|forbidden|');
 for(const role of ['anon','authenticated']){denied(`set role ${role};select * from vendor_signups;`);denied(`set role ${role};${submit(key())}`);denied(`set role ${role};${review(id)}`);}
 const created=sql(review(id));assert.ok(created.startsWith('t||'));const vendor=created.split('|')[2];
 expect("select status||'|'||accepting_leads||'|'||insurance_verified from vendors",'DISCOVERED|false|false');expect('select count(*) from vendor_services','2');expect('select count(*) from vendor_locations','2');
 expect(review(id),`f|already_reviewed|${vendor}`);
 expect('select count(*) from vendors','1');
 const second=key();expect(submit(second),'t|');const id2=sql(`select id from vendor_signups where submission_key='${second}'`);expect(review(id2),'f|possible_duplicate|');
 const before=sql('select row_to_json(v)::text from vendors v');expect(review(id2,'link',vendor),`t||${vendor}`);expect('select row_to_json(v)::text from vendors v',before);
 const third=key();expect(submit(third),'t|');const id3=sql(`select id from vendor_signups where submission_key='${third}'`);expect(review(id3,'dismiss'),'t||');expect(submit(key()),'f|rate_limited');expect(submit(first),'t|');
 const fourth=key();expect(`set role service_role;${submit(fourth,{...base,businessName:'Other',email:'other@example.invalid'})}`,'SET\nt|');const id4=sql(`select id from vendor_signups where submission_key='${fourth}'`);
 // Mid-transaction mapping failure must leave both signup and vendor database untouched.
 sql("alter table vendor_locations add constraint reject_test check(location_id<>'town-b') not valid;");
 denied(review(id4));expect('select count(*) from vendors','1');expect(`select status from vendor_signups where id='${id4}'`,'PENDING');
 sql('alter table vendor_locations drop constraint reject_test');
 assert.ok(sql(`set role service_role;${review(id4)}`).startsWith('SET\nt||'));
 const parallelSql=async text=>(await promisify(execFile)(join(bin,'psql'),['-h',dir,'-p',port,'-d','postgres','-v','ON_ERROR_STOP=1','-At','-c',text])).stdout.trim();
 const raceKey=key(),racePayload={...base,businessName:'Race Business',email:'race@example.invalid'};
 assert.deepEqual(await Promise.all([parallelSql(submit(raceKey,racePayload)),parallelSql(submit(raceKey,racePayload))]),['t|','t|']);
 const raceId=sql(`select id from vendor_signups where submission_key='${raceKey}'`);
 const decisions=await Promise.all([parallelSql(review(raceId)),parallelSql(review(raceId))]);assert.equal(decisions.filter(v=>v.startsWith('t||')).length,1);assert.equal(decisions.filter(v=>v.startsWith('f|already_reviewed|')).length,1);
 expect("select count(*) from vendors where business_name='Race Business'",'1');
 console.log('PASS: concurrent submit/review; schema; canonical coverage; consent/email validation; retry idempotency/conflict; email throttling; duplicate review; create/link/dismiss; preserved vendor fields; stale review; admin allowlist; public-role denial; service-role access; full mapping rollback.');
}finally{try{execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'stop','-m','immediate'],{stdio:'ignore'});}catch{}rmSync(dir,{recursive:true,force:true});}
