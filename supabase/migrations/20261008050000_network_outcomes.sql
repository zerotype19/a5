-- Owner-approved connection network. Apply transactionally before enabling the feature flag.
begin;
alter table public.lead_assignments add column acceptance_due_at timestamptz;
alter table public.leads add column network_consent_version text;
alter table public.leads add column network_consented_at timestamptz;
alter table public.leads add column checkins_stopped_at timestamptz;

create table public.network_invitations (
 id uuid primary key default gen_random_uuid(),
 assignment_id uuid not null references public.lead_assignments(id),
 party text not null check(party in ('HOMEOWNER','VENDOR')),
 token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),
 recipient text not null,
 expires_at timestamptz not null,
 revoked_at timestamptz,
 status text not null default 'SENDING' check(status in ('SENDING','SENT','FAILED','UNCERTAIN')),
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 error_code text,
 actor_user_id uuid not null references auth.users(id)
);
create index network_invitations_assignment_idx on public.network_invitations(assignment_id,party,created_at);
create table public.network_reports (
 id uuid primary key default gen_random_uuid(),
 invitation_id uuid not null unique references public.network_invitations(id),
 assignment_id uuid not null references public.lead_assignments(id),
 party text not null check(party in ('HOMEOWNER','VENDOR')),
 contact text not null check(contact in ('YES','NO','UNKNOWN')),
 outcome text not null check(outcome in ('DISCUSSING','ESTIMATE','SCHEDULED','COMPLETED','DID_NOT_PROCEED','PENDING')),
 rating integer check(rating between 1 and 5),
 note text not null default '' check(char_length(note)<=2000),
 help_requested boolean not null default false,
 created_at timestamptz not null default now(),
 disputed boolean not null default false,
 excluded boolean not null default false,
 constraint completed_rating_only check(rating is null or (party='HOMEOWNER' and contact='YES' and outcome='COMPLETED'))
);
create index network_reports_assignment_idx on public.network_reports(assignment_id,created_at);
create table public.network_review_events (
 id uuid primary key default gen_random_uuid(),
 report_id uuid not null references public.network_reports(id),
 actor_user_id uuid not null references auth.users(id),
 action text not null check(action in ('DISPUTE','EXCLUDE','RESTORE')),
 reason text not null check(char_length(btrim(reason)) between 1 and 1000),
 created_at timestamptz not null default now()
);
alter table public.network_invitations enable row level security;
alter table public.network_reports enable row level security;
alter table public.network_review_events enable row level security;
revoke all on public.network_invitations,public.network_reports,public.network_review_events from anon,authenticated;
grant select,insert,update on public.network_invitations,public.network_reports,public.network_review_events to service_role;

-- Versioned disclosure is recorded atomically with the existing idempotent intake.
create function public.submit_network_request(
 p_submission_key uuid,p_full_name text,p_phone text,p_email text,
 p_preferred_contact public.preferred_contact_method,p_service_selection_status public.service_selection_status,
 p_service_id text,p_postal_code text,p_project_description text,p_urgency text,
 p_first_landing_page text,p_acquisition jsonb,p_network_consent_version text
) returns table(lead_id uuid,public_reference text)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v record;v_existing boolean;
begin
 select exists(select 1 from public.leads where submission_key=p_submission_key) into v_existing;
 if p_network_consent_version is distinct from '2026-10-08' then raise exception 'network_disclosure_required';end if;
 select * into v from public.submit_project_request_with_acquisition(p_submission_key,p_full_name,p_phone,p_email,p_preferred_contact,p_service_selection_status,p_service_id,p_postal_code,p_project_description,p_urgency,p_first_landing_page,p_acquisition);
 update public.leads l set network_consent_version=p_network_consent_version,network_consented_at=now() where l.id=v.lead_id and l.network_consent_version is null and not v_existing;
 return query select v.lead_id,v.public_reference;
end;$$;

create function public.network_prepare_vendor_notification(p_assignment_id uuid,p_token_hash text,p_expires_at timestamptz,p_actor_user_id uuid,p_acceptance_hours integer)
returns table(ok boolean,error_code text,vendor_email text)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v record;
begin
 if not exists(select 1 from public.admin_users where user_id=p_actor_user_id and active) then return query select false,'forbidden'::text,null::text;return;end if;
 if p_acceptance_hours is null or p_acceptance_hours not between 1 and 72 then return query select false,'invalid_deadline'::text,null::text;return;end if;
 perform pg_advisory_xact_lock(hashtextextended(p_assignment_id::text,805));
 select * into v from public.admin_prepare_vendor_notification(p_assignment_id,p_token_hash,p_expires_at,p_actor_user_id);
 if v.ok then update public.lead_assignments set acceptance_due_at=least(p_expires_at,now()+make_interval(hours=>p_acceptance_hours)) where id=p_assignment_id;end if;
 return query select v.ok,v.error_code,v.vendor_email;
end;$$;

create function public.network_respond_to_assignment(p_token_hash text,p_action text)
returns table(ok boolean,error_code text,lead_id uuid)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare c public.assignment_capabilities%rowtype;a public.lead_assignments%rowtype;v_assignment uuid;
begin
 select assignment_id into v_assignment from public.assignment_capabilities where token_hash=p_token_hash;
 perform pg_advisory_xact_lock(hashtextextended(v_assignment::text,805));
 select * into c from public.assignment_capabilities where token_hash=p_token_hash for update;
 if not found or c.revoked_at is not null or c.expires_at<=clock_timestamp() then return query select false,'unavailable'::text,null::uuid;return;end if;
 select * into a from public.lead_assignments where id=c.assignment_id for update;
 if a.status='ASSIGNED' and a.acceptance_due_at<=clock_timestamp() then return query select false,'offer_expired'::text,null::uuid;return;end if;
 return query select * from public.vendor_respond_to_assignment(p_token_hash,p_action);
end;$$;

create function public.admin_release_network_assignment(p_assignment_id uuid,p_actor_user_id uuid,p_reason text,p_homeowner_requested boolean)
returns table(ok boolean,error_code text)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare a public.lead_assignments%rowtype;v_status public.lead_status;
begin
 if not exists(select 1 from public.admin_users where user_id=p_actor_user_id and active) then return query select false,'forbidden'::text;return;end if;
 if char_length(btrim(coalesce(p_reason,''))) not between 1 and 1000 then return query select false,'reason_required'::text;return;end if;
 perform pg_advisory_xact_lock(hashtextextended(p_assignment_id::text,805));
 -- Same lock order as acceptance: capabilities, assignment, lead.
 perform id from public.assignment_capabilities where assignment_id=p_assignment_id order by id for update;
 select * into a from public.lead_assignments where id=p_assignment_id for update;
 if not found or a.status not in ('ASSIGNED','ACCEPTED') then return query select false,'not_open'::text;return;end if;
 select status into v_status from public.leads where id=a.lead_id for update;
 if v_status not in ('ASSIGNED','ACCEPTED','CONTACTED','ESTIMATE') then return query select false,'lead_closed'::text;return;end if;
 if a.status='ACCEPTED' and p_homeowner_requested is distinct from true then return query select false,'homeowner_permission_required'::text;return;end if;
 if a.status='ASSIGNED' and coalesce(a.acceptance_due_at,(select max(expires_at) from public.assignment_capabilities where assignment_id=a.id and revoked_at is null))>now() then return query select false,'offer_still_open'::text;return;end if;
 update public.assignment_capabilities set revoked_at=now() where assignment_id=a.id and revoked_at is null;
 update public.lead_assignments set status='CANCELLED' where id=a.id;
 update public.leads set status='QUALIFIED',updated_at=now() where id=a.lead_id;
 insert into public.lead_status_events(lead_id,from_status,to_status,event_type,occurred_at,note,actor_user_id)
 values(a.lead_id,v_status,'QUALIFIED','NetworkFallbackRequested',now(),case when a.status='ACCEPTED' then 'Operator recorded homeowner permission for another introduction. ' else 'Unaccepted opportunity released. ' end||btrim(p_reason),p_actor_user_id);
 return query select true,null::text;
end;$$;

create function public.admin_prepare_network_checkin(p_assignment_id uuid,p_party text,p_token_hash text,p_actor_user_id uuid,p_retry_uncertain boolean default false)
returns table(ok boolean,error_code text,invitation_id uuid,recipient text)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare a public.lead_assignments%rowtype;l public.leads%rowtype;v_email text;v_id uuid;last_inv public.network_invitations%rowtype;
begin
 if not exists(select 1 from public.admin_users where user_id=p_actor_user_id and active) then return query select false,'forbidden'::text,null::uuid,null::text;return;end if;
 if p_party is null or p_party not in ('HOMEOWNER','VENDOR') or p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then return query select false,'invalid_input'::text,null::uuid,null::text;return;end if;
 perform pg_advisory_xact_lock(hashtextextended(p_assignment_id::text,805));
 select * into a from public.lead_assignments where id=p_assignment_id for update;
 if not found or a.status not in ('ASSIGNED','ACCEPTED') then return query select false,'assignment_closed'::text,null::uuid,null::text;return;end if;
 select * into l from public.leads where id=a.lead_id for update;
 if p_party='HOMEOWNER' then
  if l.network_consent_version is null or l.checkins_stopped_at is not null then return query select false,'homeowner_checkin_not_permitted'::text,null::uuid,null::text;return;end if;
  select email into v_email from public.customers where id=l.customer_id;
 else
  if a.accepted_at is null then return query select false,'acceptance_required'::text,null::uuid,null::text;return;end if;
  select email into v_email from public.vendors where id=a.vendor_id;
 end if;
 if v_email is null or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then return query select false,'email_required'::text,null::uuid,null::text;return;end if;
 select * into last_inv from public.network_invitations where assignment_id=a.id and party=p_party order by created_at desc,id desc limit 1;
 if last_inv.status='SENDING' and last_inv.created_at>now()-interval '15 minutes' then return query select false,'send_in_progress'::text,null::uuid,null::text;return;end if;
 if last_inv.status in ('SENDING','UNCERTAIN') and p_retry_uncertain is distinct from true then return query select false,'inspect_uncertain_delivery'::text,null::uuid,null::text;return;end if;
 if last_inv.status='SENT' and last_inv.sent_at>now()-interval '24 hours' then return query select false,'recently_sent'::text,null::uuid,null::text;return;end if;
 update public.network_invitations set revoked_at=now() where assignment_id=a.id and party=p_party and revoked_at is null;
 insert into public.network_invitations(assignment_id,party,token_hash,recipient,expires_at,actor_user_id)
 values(a.id,p_party,p_token_hash,lower(btrim(v_email)),now()+interval '14 days',p_actor_user_id) returning id into v_id;
 return query select true,null::text,v_id,lower(btrim(v_email));
end;$$;

create function public.finish_network_checkin(p_invitation_id uuid,p_status text,p_error text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if p_status is null or p_status not in ('SENT','FAILED','UNCERTAIN') then return false;end if;
 update public.network_invitations set status=p_status,sent_at=case when p_status='SENT' then now() else null end,error_code=left(p_error,100) where id=p_invitation_id and status='SENDING';
 return found;
end;$$;

create function public.submit_network_report(p_token_hash text,p_contact text,p_outcome text,p_rating integer,p_note text,p_help_requested boolean)
returns table(ok boolean,error_code text)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare i public.network_invitations%rowtype;a public.lead_assignments%rowtype;
begin
 select * into i from public.network_invitations where token_hash=p_token_hash for update;
 if not found or i.revoked_at is not null or i.expires_at<=clock_timestamp() or i.status='FAILED' then return query select false,'unavailable'::text;return;end if;
 if exists(select 1 from public.network_reports where invitation_id=i.id) then return query select true,'already_recorded'::text;return;end if;
 select * into a from public.lead_assignments where id=i.assignment_id;
 if p_contact is null or p_contact not in ('YES','NO','UNKNOWN') or p_outcome is null or p_outcome not in ('DISCUSSING','ESTIMATE','SCHEDULED','COMPLETED','DID_NOT_PROCEED','PENDING') or char_length(coalesce(p_note,''))>2000 or p_help_requested is null then return query select false,'invalid_input'::text;return;end if;
 if p_contact<>'YES' and p_outcome in ('ESTIMATE','SCHEDULED','COMPLETED') then return query select false,'contact_required'::text;return;end if;
 if p_outcome='COMPLETED' and a.accepted_at is null then return query select false,'acceptance_required'::text;return;end if;
 if p_rating is not null and (i.party<>'HOMEOWNER' or a.accepted_at is null or p_contact<>'YES' or p_outcome<>'COMPLETED' or p_rating not between 1 and 5) then return query select false,'rating_not_eligible'::text;return;end if;
 insert into public.network_reports(invitation_id,assignment_id,party,contact,outcome,rating,note,help_requested)
 values(i.id,i.assignment_id,i.party,p_contact,p_outcome,p_rating,btrim(coalesce(p_note,'')),i.party='HOMEOWNER' and p_help_requested);
 return query select true,null::text;
end;$$;

create function public.stop_network_checkins(p_token_hash text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_lead uuid;
begin
 select a.lead_id into v_lead from public.network_invitations i join public.lead_assignments a on a.id=i.assignment_id where i.token_hash=p_token_hash and i.party='HOMEOWNER' and i.revoked_at is null and i.expires_at>now();
 if v_lead is null then return false;end if;
 update public.leads set checkins_stopped_at=now() where id=v_lead;
 return true;
end;$$;

create function public.admin_moderate_network_report(p_report_id uuid,p_action text,p_reason text,p_actor_user_id uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if not exists(select 1 from public.admin_users where user_id=p_actor_user_id and active) or p_action is null or p_action not in ('DISPUTE','EXCLUDE','RESTORE') or char_length(btrim(coalesce(p_reason,''))) not between 1 and 1000 then return false;end if;
 update public.network_reports set disputed=p_action='DISPUTE',excluded=p_action='EXCLUDE' where id=p_report_id;
 if not found then return false;end if;
 insert into public.network_review_events(report_id,actor_user_id,action,reason) values(p_report_id,p_actor_user_id,p_action,btrim(p_reason));
 return true;
end;$$;

create function public.admin_record_network_permission(p_lead_id uuid,p_reason text,p_actor_user_id uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_status public.lead_status;
begin
 if not exists(select 1 from public.admin_users where user_id=p_actor_user_id and active) or char_length(btrim(coalesce(p_reason,''))) not between 1 and 1000 then return false;end if;
 select status into v_status from public.leads where id=p_lead_id for update;
 if not found then return false;end if;
 update public.leads set network_consent_version='operator-confirmed-2026-10-08',network_consented_at=now(),checkins_stopped_at=null where id=p_lead_id;
 insert into public.lead_status_events(lead_id,from_status,to_status,event_type,occurred_at,note,actor_user_id)
 values(p_lead_id,v_status,v_status,'NetworkFollowupPermissionRecorded',now(),btrim(p_reason),p_actor_user_id);
 return true;
end;$$;
revoke all on function public.admin_record_network_permission(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.admin_record_network_permission(uuid,text,uuid) to service_role;

-- Restrict every new RPC, including definer functions, to the trusted server.
revoke all on function public.submit_network_request(uuid,text,text,text,public.preferred_contact_method,public.service_selection_status,text,text,text,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_network_request(uuid,text,text,text,public.preferred_contact_method,public.service_selection_status,text,text,text,text,text,jsonb,text) to service_role;
revoke all on function public.network_prepare_vendor_notification(uuid,text,timestamptz,uuid,integer),public.network_respond_to_assignment(text,text),public.admin_release_network_assignment(uuid,uuid,text,boolean),public.admin_prepare_network_checkin(uuid,text,text,uuid,boolean),public.finish_network_checkin(uuid,text,text),public.submit_network_report(text,text,text,integer,text,boolean),public.stop_network_checkins(text),public.admin_moderate_network_report(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.network_prepare_vendor_notification(uuid,text,timestamptz,uuid,integer),public.network_respond_to_assignment(text,text),public.admin_release_network_assignment(uuid,uuid,text,boolean),public.admin_prepare_network_checkin(uuid,text,text,uuid,boolean),public.finish_network_checkin(uuid,text,text),public.submit_network_report(text,text,text,integer,text,boolean),public.stop_network_checkins(text),public.admin_moderate_network_report(uuid,text,text,uuid) to service_role;
commit;
notify pgrst,'reload schema';
