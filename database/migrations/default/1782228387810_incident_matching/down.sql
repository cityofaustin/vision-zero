DROP VIEW IF EXISTS vz_incident_records_view;

ALTER TABLE crashes
    drop COLUMN vz_incident_id,
    drop column vz_incident_match_status,
    drop COLUMN vz_incident_matched_ids;

ALTER TABLE cad_incidents
    drop column agency_type_short,
    drop column vz_incident_match_status,
    drop column vz_incident_matched_ids,
    DROP CONSTRAINT cad_incidents_agency_type_check;

DROP INDEX IF EXISTS idx_cad_incidents_master_incident_number;

ALTER TABLE ems__incidents
    drop COLUMN vz_incident_id,
    drop COLUMN vz_incident_match_status,
    drop COLUMN vz_incident_matched_ids;

ALTER TABLE afd__incidents
    drop COLUMN vz_incident_id,
    drop COLUMN vz_incident_match_status,
    drop COLUMN vz_incident_matched_ids;
