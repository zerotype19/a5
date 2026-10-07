-- Owner-authorized wave 2: request geography only. Does not assert vendor coverage.
-- No vendor is activated or assigned and no vendor_locations mappings are added.
insert into public.locations (id, name, slug, state) values
 ('livingston', 'Livingston', 'livingston', 'NJ'),
 ('summit', 'Summit', 'summit', 'NJ'),
 ('hanover-township', 'Hanover Township', 'hanover-township', 'NJ')
on conflict (id) do nothing;
