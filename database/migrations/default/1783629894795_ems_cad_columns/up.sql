ALTER TABLE ems__incidents
    ADD COLUMN incident_id bigint,
    ADD COLUMN incident_problem_initial text,
    ADD COLUMN incident_dispositions text;

COMMENT ON COLUMN public.ems__incidents.incident_id is 
    'The CAD incident ID. Equivalent to cad_incidents.master_incident_id.';

COMMENT ON COLUMN public.ems__incidents.incident_problem_initial is
    'The initial problem of the corresponding CAD incident.';

COMMENT ON COLUMN public.ems__incidents.incident_dispositions is
    'The slash (/)-separated dispositions listed in the corresponding'
    'CAD incident. Equivalent to cad_incidents.call_disposition';

DROP TRIGGER IF EXISTS ems_incidents_trigger_insert_set_patient_injry_sev on ems__incidents;

CREATE TRIGGER ems_incidents_trigger_insert_update_set_patient_injry_sev
    BEFORE INSERT OR UPDATE ON ems__incidents
    FOR EACH ROW EXECUTE FUNCTION update_ems_patient_injry_sev();
