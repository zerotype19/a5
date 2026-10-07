/** Isolated PostgreSQL integration test. Never connects to Supabase or a running database. */
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const bin=execFileSync('pg_config',['--bindir'],{encoding:'utf8'}).trim();
const dir=mkdtempSync(join(tmpdir(),'a5-launch-db-'));
const port='54389';
function sql(text){return execFileSync(join(bin,'psql'),['-h',dir,'-p',port,'-d','postgres','-v','ON_ERROR_STOP=1'],{input:text,encoding:'utf8'});}
try{
 execFileSync(join(bin,'initdb'),['-D',join(dir,'data'),'-A','trust','--no-locale'],{stdio:'ignore'});
 execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'-l',join(dir,'log'),'-o',`-k ${dir} -p ${port} -c listen_addresses=''`,'start'],{stdio:'ignore'});
 sql(`create role anon;create role authenticated;create role service_role;
 create type public.preferred_contact_method as enum('phone','email','text');
 create type public.service_selection_status as enum('SELECTED','NOT_SURE');
 create table public.leads(id uuid primary key,submission_key uuid unique);
 create function public.submit_project_request(p_submission_key uuid,p_full_name text,p_phone text,p_email text,p_preferred_contact public.preferred_contact_method,p_service_selection_status public.service_selection_status,p_service_id text,p_postal_code text,p_project_description text,p_urgency text,p_first_landing_page text default null) returns table(lead_id uuid,public_reference text) language plpgsql as $$begin insert into public.leads values(p_submission_key,p_submission_key) on conflict do nothing;return query select p_submission_key,case when p_service_id='force-fail' then null::text else 'A5-TEST' end;end$$;`);
 const migration=readFileSync(new URL('../supabase/migrations/20261007170000_a5_launch_attribution_outbox.sql',import.meta.url),'utf8');sql(migration);sql(migration);
 const call=(id,service='masonry',acquisition=`'{"first":{"path":"/services/masonry"},"last":{"path":"/services/masonry"}}'::jsonb`)=>`select * from public.submit_project_request_with_acquisition('${id}','Test User','5555555555','test@example.invalid','phone','SELECTED','${service}','07940','Test project only','EXPLORING','/services/masonry',${acquisition});`;
 const id='00000000-0000-4000-8000-000000000001';
 sql(call(id));sql(call(id,'masonry',`'{"first":{"path":"/changed"},"last":{"path":"/changed"}}'::jsonb`));
 sql(`do $$begin if (select count(*) from public.leads)<>1 or (select count(*) from public.lead_notification_outbox)<>1 then raise exception 'duplicate lead or alert';end if;if (select first_touch->>'path' from public.lead_acquisition)<>'/services/masonry' then raise exception 'first touch overwritten';end if;end$$;`);
 sql('select * from public.claim_lead_notifications();');
 sql(`do $$begin if (select count(*) from public.claim_lead_notifications())<>0 then raise exception 'claimed twice';end if;end$$;`);
 for(const role of ['anon','authenticated']){let denied=false;try{sql(`set role ${role};select * from public.lead_acquisition;`);}catch{denied=true;}if(!denied)throw new Error('Public acquisition access');denied=false;try{sql(`set role ${role};${call(id)}`);}catch{denied=true;}if(!denied)throw new Error('Public RPC access');}
 let failed=false;try{sql(call('00000000-0000-4000-8000-000000000002','force-fail'));}catch{failed=true;}if(!failed)throw new Error('Expected transaction failure');
 sql(`do $$begin if (select count(*) from public.leads)<>1 then raise exception 'partial lead persisted';end if;end$$;`);
 sql(`set role service_role;${call('00000000-0000-4000-8000-000000000003')}`);
 console.log('PASS: migration reapplies; retries preserve first touch; one lead/alert; queue claims once; public roles denied; failed outbox rolls back lead; service-role submit succeeds.');
}finally{try{execFileSync(join(bin,'pg_ctl'),['-D',join(dir,'data'),'stop','-m','immediate'],{stdio:'ignore'});}catch{}rmSync(dir,{recursive:true,force:true});}
