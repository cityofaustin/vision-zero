ALTER TABLE ems__incidents
    ADD COLUMN incident_id bigint,
    ADD COLUMN incident_problem_initial text,
    ADD COLUMN incident_dispositions text;
