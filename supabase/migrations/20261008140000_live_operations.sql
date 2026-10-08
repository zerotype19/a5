begin;
alter table public.leads add column archived_at timestamptz;
alter table public.vendors add column archived_at timestamptz;
-- Transactional receipts share the existing durable outbox and atomic claim runner.
alter table public.lead_notification_outbox drop constraint lead_notification_outbox_kind_check;
alter table public.lead_notification_outbox add constraint lead_notification_outbox_kind_check check(kind in ('operations_new_lead','homeowner_receipt'));
create function public.enqueue_homeowner_receipt() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if new.kind='operations_new_lead' then
  insert into public.lead_notification_outbox(lead_id,kind,public_reference) values(new.lead_id,'homeowner_receipt',new.public_reference) on conflict do nothing;
 end if;return new;
end $$;
create trigger homeowner_receipt after insert on public.lead_notification_outbox for each row execute function public.enqueue_homeowner_receipt();
-- Enable only after deploying the runner that understands homeowner_receipt.
alter table public.lead_notification_outbox disable trigger homeowner_receipt;
revoke all on function public.enqueue_homeowner_receipt() from public,anon,authenticated;
create table public.vendor_progress_reports(
 id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.lead_assignments(id),
 status text not null check(status in ('CONTACTED','ESTIMATE_SENT','SCHEDULED','COMPLETED','DISQUALIFIED','UNREACHABLE')),
 note text not null default '' check(length(note)<=1000), created_at timestamptz not null default now()
);
alter table public.vendor_progress_reports enable row level security;
revoke all on public.vendor_progress_reports from anon,authenticated;
grant select,insert on public.vendor_progress_reports to service_role;
create index vendor_progress_assignment_time on public.vendor_progress_reports(assignment_id,created_at desc);
create function public.report_vendor_progress(p_token_hash text,p_status text,p_note text) returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
declare a public.lead_assignments; c public.assignment_capabilities;
begin
 if p_status not in ('CONTACTED','ESTIMATE_SENT','SCHEDULED','COMPLETED','DISQUALIFIED','UNREACHABLE') or p_status is null or length(coalesce(p_note,''))>1000 then return false;end if;
 select * into c from public.assignment_capabilities where token_hash=p_token_hash;
 if c.id is null then return false;end if;
 perform pg_advisory_xact_lock(hashtextextended(c.assignment_id::text,805));
 select * into c from public.assignment_capabilities where token_hash=p_token_hash for update;
 if c.id is null or c.revoked_at is not null or c.expires_at<=now() then return false;end if;
 select * into a from public.lead_assignments where id=c.assignment_id for update;
 if a.id is null or a.status<>'ACCEPTED' or exists(select 1 from public.leads where id=a.lead_id and (archived_at is not null or status in ('INVALID','DUPLICATE','UNSERVICEABLE','LOST','WON'))) then return false;end if;
 -- Repeated double-click submissions do not duplicate the latest report.
 if exists(select 1 from (select status,note from public.vendor_progress_reports where assignment_id=a.id order by created_at desc limit 1) r where r.status=p_status and r.note=trim(coalesce(p_note,''))) then return true;end if;
 insert into public.vendor_progress_reports(assignment_id,status,note)values(a.id,p_status,trim(coalesce(p_note,'')));
 update public.leads set updated_at=now() where id=a.lead_id;
 return true;
end $$;
revoke all on function public.report_vendor_progress(text,text,text) from public,anon,authenticated;
grant execute on function public.report_vendor_progress(text,text,text) to service_role;
-- Enforce current owner-selected service/geography and active-email requirements atomically.
create function public.check_assignment_coverage() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare l public.leads;v public.vendors;
begin
 select * into l from public.leads where id=new.lead_id;
 select * into v from public.vendors where id=new.vendor_id;
 if l.archived_at is not null or v.archived_at is not null or v.status<>'ACTIVE' or coalesce(trim(v.email),'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or l.service_id is null or l.location_id is null or not exists(select 1 from public.vendor_services where vendor_id=v.id and service_id=l.service_id) or not exists(select 1 from public.vendor_locations where vendor_id=v.id and location_id=l.location_id) then raise exception 'Vendor must be active with email and match the requested service and town';end if;
 return new;
end $$;
create trigger assignment_coverage before insert on public.lead_assignments for each row execute function public.check_assignment_coverage();
commit;
notify pgrst,'reload schema';
