alter table cad_incidents drop column match_status;
alter table cad_incidents drop column vz_incident_id;

drop table vz_incidents cascade;
