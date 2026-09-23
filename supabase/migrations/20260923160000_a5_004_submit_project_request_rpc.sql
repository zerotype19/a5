-- TASK A5-004: Atomic project submission RPC
-- CHANGE: Add public.submit_project_request(...) SECURITY DEFINER function
-- REASON: One transactional Customer + Lead + LeadCreated for validated server submits
-- DESTRUCTIVE: NO
-- OWNER APPROVAL: A5-004 owner decision (Option 1)
-- DO NOT APPLY TO PRODUCTION without explicit owner approval

-- ---------------------------------------------------------------------------
-- submit_project_request
-- SECURITY MODEL:
--   - SECURITY DEFINER with fixed search_path (pg_catalog, public)
--   - Fully schema-qualified writes
--   - EXECUTE revoked from PUBLIC / anon / authenticated
--   - EXECUTE granted only to service_role
--   - Public browser never calls this directly; A5 server validates + Turnstile first
-- ---------------------------------------------------------------------------

create or replace function public.submit_project_request(
  p_full_name text,
  p_phone text,
  p_email text,
  p_preferred_contact public.preferred_contact_method,
  p_service_selection_status public.service_selection_status,
  p_service_id text,
  p_postal_code text,
  p_project_description text,
  p_urgency text
)
returns table (
  lead_id uuid,
  public_reference text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_customer_id uuid;
  v_lead_id uuid;
  v_reference text;
begin
  -- Lightweight DB guardrails (authoritative app validation is server-side)
  if p_full_name is null or length(trim(p_full_name)) = 0 then
    raise exception 'invalid_full_name' using errcode = '22023';
  end if;

  if p_phone is null or p_email is null then
    raise exception 'invalid_contact' using errcode = '22023';
  end if;

  if p_service_selection_status = 'SELECTED' then
    if p_service_id is null then
      raise exception 'selected_requires_service' using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.services s where s.id = p_service_id
    ) then
      raise exception 'unknown_service' using errcode = '22023';
    end if;
  elsif p_service_selection_status = 'NOT_SURE' then
    if p_service_id is not null then
      raise exception 'not_sure_requires_null_service' using errcode = '22023';
    end if;
  else
    raise exception 'invalid_service_selection_status' using errcode = '22023';
  end if;

  if p_postal_code is null or p_postal_code !~ '^[0-9]{5}$' then
    raise exception 'invalid_postal_code' using errcode = '22023';
  end if;

  if p_project_description is null
     or length(trim(p_project_description)) < 10
     or length(p_project_description) > 2000 then
    raise exception 'invalid_project_description' using errcode = '22023';
  end if;

  if p_urgency is null or length(trim(p_urgency)) = 0 then
    raise exception 'invalid_urgency' using errcode = '22023';
  end if;

  insert into public.customers (
    full_name,
    phone,
    email,
    preferred_contact_method
  ) values (
    trim(p_full_name),
    trim(p_phone),
    trim(p_email),
    p_preferred_contact
  )
  returning id into v_customer_id;

  insert into public.leads (
    customer_id,
    service_id,
    location_id,
    project_description,
    urgency,
    status,
    service_selection_status,
    postal_code
  ) values (
    v_customer_id,
    p_service_id,
    null,
    trim(p_project_description),
    trim(p_urgency),
    'NEW',
    p_service_selection_status,
    p_postal_code
  )
  returning id into v_lead_id;

  insert into public.lead_status_events (
    lead_id,
    from_status,
    to_status,
    event_type,
    occurred_at
  ) values (
    v_lead_id,
    null,
    'NEW',
    'LeadCreated',
    now()
  );

  v_reference := 'A5-' || upper(substr(replace(v_lead_id::text, '-', ''), 1, 8));

  return query select v_lead_id, v_reference;
end;
$$;

comment on function public.submit_project_request(
  text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text
) is
  'A5-004 atomic Customer+Lead+LeadCreated. Callable only via service_role after server validation/Turnstile. Not a public API.';

revoke all on function public.submit_project_request(
  text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text
) from public;

revoke all on function public.submit_project_request(
  text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text
) from anon;

revoke all on function public.submit_project_request(
  text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text
) from authenticated;

grant execute on function public.submit_project_request(
  text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text
) to service_role;
