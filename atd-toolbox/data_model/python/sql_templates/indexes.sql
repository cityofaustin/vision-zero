create index on public.people_cris (unit_id);
create index on public.people_cris (prsn_injry_sev_id);
create index on public.people_cris (cris_crash_id);
create index on public.people_cris (cris_crash_id, unit_nbr, prsn_nbr); -- charges -> person trigger
create index on public.people_cris (unit_id); -- charges -> crash id trigger
create index on public.units_cris (cris_crash_id, unit_nbr); -- people -> unit_id trigger
create index on public.units (crash_id);
create index on public.people (unit_id);
create index on public.people (prsn_injry_sev_id);
-- more todo
-- address fields
-- crash location_id
-- crash date
-- X - tested but no improvement: crash_edits: longitude and latitude (for qa status)
