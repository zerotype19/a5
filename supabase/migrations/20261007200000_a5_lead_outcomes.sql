-- Owner-approved operating-plan completion. Additive; private lead data only.
-- Enable ENABLE_LEAD_OUTCOMES only after this migration and its tests pass.
begin;
alter table public.leads add column if not exists contacted_at timestamptz;
alter table public.leads add column if not exists estimate_recorded_at timestamptz;
alter table public.leads add column if not exists closed_at timestamptz;
alter table public.leads add column if not exists loss_reason text;
alter table public.leads add column if not exists follow_up_at timestamptz;
create index if not exists leads_follow_up_due_idx on public.leads (follow_up_at) where follow_up_at is not null;

create or replace function public.admin_record_lead_outcome(
 p_lead_id uuid, p_expected_status public.lead_status, p_expected_updated_at timestamptz,
 p_to_status public.lead_status, p_actor_user_id uuid,
 p_estimated_value numeric default null, p_actual_value numeric default null,
 p_loss_reason text default null, p_follow_up_at timestamptz default null
) returns table(ok boolean, error_code text)
language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_lead public.leads%rowtype; v_event text; v_note text; v_now timestamptz := clock_timestamp();
begin
 if p_actor_user_id is null or not exists(select 1 from public.admin_users where user_id=p_actor_user_id and active) then
  return query select false,'actor_required'::text; return;
 end if;
 select * into v_lead from public.leads where id=p_lead_id for update;
 if not found then return query select false,'lead_not_found'::text; return; end if;
 if p_expected_status is distinct from v_lead.status or p_expected_updated_at is distinct from v_lead.updated_at then
  return query select false,'stale_status'::text; return;
 end if;
 if p_to_status is null or not (
  (v_lead.status in ('QUALIFIED','ACCEPTED','CONTACTED','ESTIMATE','WON','LOST') and p_to_status=v_lead.status)
  or (v_lead.status='QUALIFIED' and p_to_status='LOST')
  or (v_lead.status='ACCEPTED' and p_to_status in ('CONTACTED','LOST'))
  or (v_lead.status='CONTACTED' and p_to_status in ('ESTIMATE','LOST'))
  or (v_lead.status='ESTIMATE' and p_to_status in ('WON','LOST'))
 ) then return query select false,'invalid_transition'::text; return; end if;
 if (p_estimated_value is not null and (p_estimated_value::text in ('NaN','Infinity','-Infinity') or p_estimated_value<0 or p_estimated_value>9999999999.99 or p_estimated_value<>round(p_estimated_value,2)))
 or (p_actual_value is not null and (p_actual_value::text in ('NaN','Infinity','-Infinity') or p_actual_value<0 or p_actual_value>9999999999.99 or p_actual_value<>round(p_actual_value,2))) then
  return query select false,'invalid_value'::text; return;
 end if;
 if p_to_status='LOST' and (p_loss_reason is null or length(trim(p_loss_reason)) not between 1 and 2000) then
  return query select false,'loss_reason_required'::text; return;
 end if;
 if p_follow_up_at is not null and not isfinite(p_follow_up_at) then return query select false,'invalid_follow_up'::text; return; end if;
 -- Retain the accepted assignment as historical truth; closing a lead is not a vendor pass.
 update public.leads set status=p_to_status,
  estimated_project_value=p_estimated_value, actual_project_value=p_actual_value,
  contacted_at=case when p_to_status='CONTACTED' then coalesce(contacted_at,v_now) else contacted_at end,
  estimate_recorded_at=case when p_to_status='ESTIMATE' then coalesce(estimate_recorded_at,v_now) else estimate_recorded_at end,
  closed_at=case when p_to_status in ('WON','LOST') then coalesce(closed_at,v_now) else closed_at end,
  loss_reason=case when p_to_status='LOST' then trim(p_loss_reason) else null end,
  follow_up_at=case when p_to_status in ('WON','LOST') then null else p_follow_up_at end,
  updated_at=v_now where id=p_lead_id;
 v_event:=case when p_to_status=v_lead.status then 'OutcomeDetailsUpdated' when p_to_status='CONTACTED' then 'CustomerContacted' when p_to_status='ESTIMATE' then 'EstimateCreated' when p_to_status='WON' then 'LeadWon' else 'LeadLost' end;
 v_note:=jsonb_build_object('estimated_project_value',p_estimated_value,'actual_project_value',p_actual_value,'follow_up_at',case when p_to_status in ('WON','LOST') then null else p_follow_up_at end,'loss_reason',case when p_to_status='LOST' then trim(p_loss_reason) else null end)::text;
 insert into public.lead_status_events(lead_id,event_type,from_status,to_status,note,actor_user_id,occurred_at)
 values(p_lead_id,v_event,v_lead.status,p_to_status,v_note,p_actor_user_id,v_now);
 return query select true,null::text;
end $$;
revoke all on function public.admin_record_lead_outcome(uuid,public.lead_status,timestamptz,public.lead_status,uuid,numeric,numeric,text,timestamptz) from public,anon,authenticated;
grant execute on function public.admin_record_lead_outcome(uuid,public.lead_status,timestamptz,public.lead_status,uuid,numeric,numeric,text,timestamptz) to service_role;
commit;
