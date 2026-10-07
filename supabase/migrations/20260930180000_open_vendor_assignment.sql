-- Owner: any qualified lead may be assigned to any vendor.
-- Coverage, ACTIVE, and accepting_leads are no longer assignment gates.
-- A vendor who already PASSED this lead still cannot be assigned again.
-- Email preparation no longer requires ACTIVE + accepting_leads.
-- It still requires a vendor email. It does not send mail.

create or replace function public.admin_assign_lead_to_vendor(
  p_lead_id uuid,
  p_vendor_id uuid,
  p_actor_user_id uuid
)
returns table (
  ok boolean,
  error_code text,
  assignment_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status public.lead_status;
  v_assignment uuid;
begin
  if p_lead_id is null or p_vendor_id is null then
    return query select false, 'invalid_input'::text, null::uuid;
    return;
  end if;

  if p_actor_user_id is null then
    return query select false, 'actor_required'::text, null::uuid;
    return;
  end if;

  select l.status
    into v_status
  from public.leads l
  where l.id = p_lead_id
  for update;

  if v_status is null then
    return query select false, 'lead_not_found'::text, null::uuid;
    return;
  end if;

  if v_status is distinct from 'QUALIFIED' then
    return query select false, 'stale_status'::text, null::uuid;
    return;
  end if;

  if exists (
    select 1
    from public.lead_assignments a
    where a.lead_id = p_lead_id
      and a.status in ('ASSIGNED', 'ACCEPTED')
  ) then
    return query select false, 'active_assignment_exists'::text, null::uuid;
    return;
  end if;

  if exists (
    select 1
    from public.lead_assignments passed
    where passed.lead_id = p_lead_id
      and passed.vendor_id = p_vendor_id
      and passed.status = 'PASSED'
  ) then
    return query select false, 'vendor_previously_passed'::text, null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.vendors v
    where v.id = p_vendor_id
  ) then
    return query select false, 'vendor_not_eligible'::text, null::uuid;
    return;
  end if;

  insert into public.lead_assignments (
    lead_id,
    vendor_id,
    status,
    assigned_at,
    assigned_by
  ) values (
    p_lead_id,
    p_vendor_id,
    'ASSIGNED',
    now(),
    p_actor_user_id
  )
  returning id into v_assignment;

  update public.leads
     set status = 'ASSIGNED',
         updated_at = now()
   where id = p_lead_id
     and status = 'QUALIFIED';

  if not found then
    raise exception 'assignment_lead_update_failed';
  end if;

  insert into public.lead_status_events (
    lead_id,
    from_status,
    to_status,
    event_type,
    occurred_at,
    note,
    actor_user_id
  ) values (
    p_lead_id,
    'QUALIFIED',
    'ASSIGNED',
    'VendorAssigned',
    now(),
    null,
    p_actor_user_id
  );

  return query select true, null::text, v_assignment;
exception
  when unique_violation then
    return query select false, 'active_assignment_exists'::text, null::uuid;
end;
$$;

comment on function public.admin_assign_lead_to_vendor(uuid, uuid, uuid) is
  'Manual assignment of any qualified lead to any vendor. A prior PASS on that lead still blocks that vendor. Email is a separate step.';

create or replace function public.admin_prepare_vendor_notification(
  p_assignment_id uuid,
  p_token_hash text,
  p_expires_at timestamptz,
  p_actor_user_id uuid
)
returns table (
  ok boolean,
  error_code text,
  vendor_email text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status public.lead_assignment_status;
  v_vendor uuid;
  v_notice text;
  v_email text;
begin
  if p_actor_user_id is null then
    return query select false, 'actor_required'::text, null::text;
    return;
  end if;

  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalid_token'::text, null::text;
    return;
  end if;

  if p_expires_at is null
     or p_expires_at <= now()
     or p_expires_at > now() + interval '73 hours' then
    return query select false, 'invalid_expiry'::text, null::text;
    return;
  end if;

  select a.status, a.vendor_id, a.notification_status
    into v_status, v_vendor, v_notice
  from public.lead_assignments a
  where a.id = p_assignment_id
  for update;

  if v_status is null then
    return query select false, 'assignment_not_found'::text, null::text;
    return;
  end if;

  if v_status is distinct from 'ASSIGNED' then
    return query select false, 'assignment_not_open'::text, null::text;
    return;
  end if;

  if v_notice = 'SENT' then
    return query select false, 'already_sent'::text, null::text;
    return;
  end if;

  select v.email
    into v_email
  from public.vendors v
  where v.id = v_vendor;

  if v_email is null or length(trim(v_email)) = 0 then
    return query select false, 'vendor_email_required'::text, null::text;
    return;
  end if;

  update public.assignment_capabilities as c
     set revoked_at = now()
   where c.assignment_id = p_assignment_id
     and c.revoked_at is null;

  insert into public.assignment_capabilities (assignment_id, token_hash, expires_at)
  values (p_assignment_id, p_token_hash, p_expires_at);

  update public.lead_assignments as a
     set notification_status = 'PENDING',
         notification_attempted_at = now(),
         notification_sent_at = null,
         notification_error = null
   where a.id = p_assignment_id;

  return query select true, null::text, v_email;
end;
$$;

comment on function public.admin_prepare_vendor_notification(uuid, text, timestamptz, uuid) is
  'Start a delivery attempt for any assigned vendor who has an email. Does not send email.';
