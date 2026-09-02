drop view if exists vz_incident_records_view;
alter table crashes drop column vz_incident_id;
alter table cad_incidents drop column vz_incident_id;
alter table ems__incidents drop column vz_incident_id;
alter table afd__incidents drop column vz_incident_id;
drop table if exists vz_incidents;
