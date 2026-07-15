ALTER TABLE ems__incidents
    DROP COLUMN incident_id,
    DROP COLUMN incident_problem_initial,
    DROP COLUMN incident_dispositions;

ems_incidents_trigger_insert_update_set_patient_injry_sev
DROP TRIGGER IF EXISTS ems_incidents_trigger_insert_update_set_patient_injry_sev on ems__incidents;

CREATE TRIGGER ems_incidents_trigger_insert_set_patient_injry_sev
    BEFORE INSERT ON ems__incidents
    FOR EACH ROW EXECUTE FUNCTION update_ems_patient_injry_sev();
