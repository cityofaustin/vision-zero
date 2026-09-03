drop view if exists vz_incident_records_view;

alter table crashes
drop column vz_incident_id,
drop column vz_incident_match_status,
drop column vz_incident_matched_ids;

alter table cad_incidents
drop column vz_incident_id,
drop column vz_incident_match_status,
drop column vz_incident_matched_ids;

alter table ems__incidents
drop column vz_incident_id,
drop column vz_incident_match_status,
drop column vz_incident_matched_ids;

alter table afd__incidents
drop column vz_incident_id,
drop column vz_incident_match_status,
drop column vz_incident_matched_ids;

drop table if exists vz_incidents;
