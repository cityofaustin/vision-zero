create index on db.people_cris (unit_id);
create index on db.people_cris (prsn_injry_sev_id);
create index on db.people_cris (crash_id);
create index on db.people_cris (crash_id, unit_nbr, prsn_nbr); -- charges -> person trigger
create index on db.units_cris (crash_id, unit_nbr); -- people -> unit_id trigger
create index on db.units_unified (crash_id);
create index on db.people_unified (unit_id);
create index on db.people_unified (prsn_injry_sev_id);
-- more todo
-- address fields
-- crash location_id
-- crash date
-- X - tested but no improvement: crash_edits: longitude and latitude (for qa status)