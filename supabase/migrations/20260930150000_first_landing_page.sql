-- First same-site landing page on project submit
-- CHANGE: submit_project_request accepts p_first_landing_page and writes
--   leads.first_landing_page once, on insert only.
-- REASON: The first 10 requests need the A5 page that started the visit.
-- DESTRUCTIVE: NO
-- Does not add a table. Does not overwrite the column after lead creation.
-- Production apply is a separate owner step. Deploy the app only after apply,
-- because the server passes the new argument.

drop function if exists public.submit_project_request(
  uuid,
  text,
  text,
  text,
  public.preferred_contact_method,
  public.service_selection_status,
  text,
  text,
  text,
  text
);

create function public.submit_project_request(
  p_submission_key uuid,
  p_full_name text,
  p_phone text,
  p_email text,
  p_preferred_contact public.preferred_contact_method,
  p_service_selection_status public.service_selection_status,
  p_service_id text,
  p_postal_code text,
  p_project_description text,
  p_urgency text,
  p_first_landing_page text default null
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
  v_landing text;
begin
  if p_submission_key is null then
    raise exception 'submission_key_required' using errcode = '22023';
  end if;

  -- Retry / lost-response path. Do not update first_landing_page.
  select l.id
    into v_lead_id
  from public.leads l
  where l.submission_key = p_submission_key;

  if v_lead_id is not null then
    v_reference := 'A5-' || upper(substr(replace(v_lead_id::text, '-', ''), 1, 8));
    return query select v_lead_id, v_reference;
    return;
  end if;

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

  v_landing := nullif(trim(coalesce(p_first_landing_page, '')), '');
  if v_landing is not null then
    if char_length(v_landing) > 200
       or v_landing !~ '^/$|^/([a-z0-9]+(-[a-z0-9]+)*)(/[a-z0-9]+(-[a-z0-9]+)*)*$'
       or v_landing ~ '^/(request-service|admin|api|opportunity)(/|$)'
    then
      v_landing := null;
    end if;
  end if;

  begin
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
      postal_code,
      submission_key,
      first_landing_page,
      first_touch_at,
      first_attribution_confidence
    ) values (
      v_customer_id,
      p_service_id,
      null,
      trim(p_project_description),
      trim(p_urgency),
      'NEW',
      p_service_selection_status,
      p_postal_code,
      p_submission_key,
      v_landing,
      case when v_landing is null then null else now() end,
      case when v_landing is null then 'UNKNOWN' else 'KNOWN' end
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
  exception
    when unique_violation then
      select l.id
        into v_lead_id
      from public.leads l
      where l.submission_key = p_submission_key;

      if v_lead_id is null then
        raise;
      end if;

      v_reference := 'A5-' || upper(substr(replace(v_lead_id::text, '-', ''), 1, 8));
      return query select v_lead_id, v_reference;
  end;
end;
$$;

comment on function public.submit_project_request(
  uuid, text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text, text
) is
  'Atomic Customer+Lead+LeadCreated keyed by submission_key. Writes first_landing_page on insert only. Callable only via service_role after server validation. submission_key is not an access credential.';

revoke all on function public.submit_project_request(
  uuid, text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.submit_project_request(
  uuid, text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text, text
) to service_role;
