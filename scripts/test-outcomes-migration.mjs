/** Real isolated PostgreSQL tests for the outcome RPC; never production. */
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
const bin=execFileSync('pg_config',['--bindir'],{encoding:'utf8'}).trim();const dir=mkdtempSync(join(tmpdir(),'a5-outcomes-db-'));const port='54390';
const sql=text=>execFileSync(join(bin,'psql'),['-h',dir,'-p',port,'-d','postgres','-v','ON_ERROR_STOP=1','-At'],{input:text,encoding:'utf8',stdio:['pipe','pipe','pipe']});
const lead='00000000-0000-4000-8000-000000000001',actor='00000000-0000-4000-8000-000000000002';
try {
 execFileSync(join(bin,'initdb'),['-D',join(dir,'data'),'-A','trust','--no-locale'],{stdio:'ignore'});
 execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'-l',join(dir,'log'),'-o',`-k ${dir} -p ${port} -c listen_addresses=''`,'start'],{stdio:'ignore'});
 sql(`create role anon;create role authenticated;create role service_role;create type public.lead_status as enum('NEW','QUALIFIED','ASSIGNED','ACCEPTED','CONTACTED','ESTIMATE','WON','LOST','INVALID','DUPLICATE','UNSERVICEABLE');
 create table public.admin_users(user_id uuid primary key,active boolean);insert into public.admin_users values('${actor}',true);
 create table public.leads(id uuid primary key,status public.lead_status,updated_at timestamptz,estimated_project_value numeric(12,2),actual_project_value numeric(12,2));
 alter table public.leads enable row level security;
 create table public.lead_status_events(lead_id uuid,event_type text,from_status public.lead_status,to_status public.lead_status,note text,actor_user_id uuid,occurred_at timestamptz);
 insert into public.leads values('${lead}','ACCEPTED','2026-01-01',null,null);`);
 const migration=readFileSync(new URL('../supabase/migrations/20261007200000_a5_lead_outcomes.sql',import.meta.url),'utf8');sql(migration);sql(migration);
 const call=(from,to,version='(select updated_at from public.leads)',extra="1200,1100,null,'2026-10-09T12:00Z'",who=actor)=>`select * from public.admin_record_lead_outcome('${lead}','${from}',${version},'${to}','${who}',${extra});`;
 const expect=(statement,result)=>{const output=sql(statement).trim();if(output!==result)throw Error(`${output} !== ${result}`);};
 expect(call('ACCEPTED','WON'),'f|invalid_transition');
 expect(call('ACCEPTED','LOST'),'f|loss_reason_required');
 expect(call('ACCEPTED','CONTACTED',undefined,"-1,100,null,null"),'f|invalid_value');
 expect(call('ACCEPTED','CONTACTED',undefined,"1.999,100,null,null"),'f|invalid_value');
 expect(call('ACCEPTED','CONTACTED',undefined,"'NaN',100,null,null"),'f|invalid_value');
 expect(call('ACCEPTED','CONTACTED',undefined,undefined,'00000000-0000-4000-8000-000000000099'),'f|actor_required');
 expect(call('ACCEPTED','CONTACTED'),'t|');
 expect(call('ACCEPTED','CONTACTED',"'2026-01-01'"),'f|stale_status');
 expect(call('CONTACTED','CONTACTED',"'2026-01-01'"),'f|stale_status');
 expect(call('CONTACTED','ESTIMATE'),'t|');expect(call('ESTIMATE','WON'),'t|');
 expect(call('WON','CONTACTED'),'f|invalid_transition');
 expect("select count(*) from public.lead_status_events",'3');
 expect("select (contacted_at is not null and estimate_recorded_at is not null and closed_at is not null and follow_up_at is null and actual_project_value=1100)::text from public.leads",'true');
 sql("update public.leads set status='CONTACTED',closed_at=null");
 expect(call('CONTACTED','LOST',undefined,"null,null,'Homeowner postponed',null"),'t|');
 expect("select loss_reason from public.leads",'Homeowner postponed');
 for(const role of ['anon','authenticated']){let denied=false;try{sql(`set role ${role};${call('LOST','LOST')}`);}catch{denied=true;}if(!denied)throw Error(`RPC exposed to ${role}`);}
 // A failure during event recording must roll back the lead mutation.
 sql("update public.leads set status='CONTACTED';alter table public.lead_status_events add constraint reject_test check(event_type <> 'EstimateCreated') not valid;");
 let rolled=false;try{sql(call('CONTACTED','ESTIMATE'));}catch{rolled=true;}if(!rolled)throw Error('Expected event failure');expect('select status from public.leads','CONTACTED');
 sql('alter table public.lead_status_events drop constraint reject_test;');
 // Service role does not need direct table permissions to call the restricted RPC.
 const version=sql('select updated_at from public.leads').trim();expect(`set role service_role;${call('CONTACTED','ESTIMATE',`'${version}'`)}`,'SET\nt|');
 console.log('PASS: migration repeat apply; complete outcomes; invalid/skipped/terminal transitions; stale retries; money/loss validation; actor and public-role denial; atomic rollback; service-role RPC.');
} finally {try{execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'stop','-m','immediate'],{stdio:'ignore'});}catch{}rmSync(dir,{recursive:true,force:true});}
