alter table cad_incidents
    drop column vz_incident_id,
    drop column is_cancelled_call;

drop table vz_incidents cascade;
