-- ---
-- --- copy locations table and restablish index
-- ---
-- create table db.locations as select * from public.atd_txdot_locations;
-- alter table db.locations add primary key (location_id);
-- create index locations_geometry_index on db.locations using gist (geometry);


---
--- copy crash notes, which can't be done until after the data migration bc of foreign key constraint
---
create table db.crash_notes as select * from public.crash_notes;
alter table db.crash_notes add primary key (id);
create sequence db.crash_notes_id_seq;
alter table db.crash_notes alter column id set default nextval('db.crash_notes_id_seq');
select setval('db.crash_notes_id_seq', (select max(id) from db.crash_notes));
alter table db.crash_notes add constraint fk_crash_notes_crash_id foreign key (crash_id) references db.crashes_unified (crash_id);
create index crash_notes_crash_id_idx on db.crash_notes (crash_id);
