alter table db.units_cris add constraint unique_units_cris unique (crash_id, unit_nbr);
alter table db.units_unified add constraint unique_units unique (crash_id, unit_nbr);
alter table db.people_cris add constraint unique_people_cris unique (unit_id, prsn_nbr);
alter table db.people_edits add constraint unique_people_edits unique (unit_id, prsn_nbr);
alter table db.people_unified add constraint unique_people_unified unique (unit_id, prsn_nbr);
-- create index on db.people_cris (unit_id);
-- create index on db.people_cris (crash_id);
-- create index on db.people_vz (unit_id);
-- create index on db.people (unit_id);

