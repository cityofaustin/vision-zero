DROP TRIGGER IF EXISTS crashes_match_vz_incident_trigger on crashes;
DROP FUNCTION IF EXISTS crashes_match_vz_incident;
DROP VIEW IF EXISTS vz_incident_records_view;
DROP INDEX IF EXISTS idx_cad_incidents_master_incident_number;

ALTER TABLE crashes
drop COLUMN vz_incident_id,
drop column vz_incident_match_status,
drop COLUMN vz_incident_matched_ids;
