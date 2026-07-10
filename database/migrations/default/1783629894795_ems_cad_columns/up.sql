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
