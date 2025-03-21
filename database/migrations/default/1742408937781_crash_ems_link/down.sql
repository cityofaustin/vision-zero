drop index ems__incidents_crashes_crash_pk_index;
drop index ems__incidents_crashes_incident_received_datetime_index;
drop index ems__incidents_apd_incident_numbers_index;
drop index ems__incidents_geometry_index;
create index crashes_case_id_index on crashes (case_id);
alter table ems__incidents drop column match_status;
alter table ems__incidents drop constraint ems__incidents_crashes_crash_pk_fkey;
alter table ems__incidents rename column crash_pk to crash_id;
