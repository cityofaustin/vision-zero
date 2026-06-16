-- Most recent migration: database/migrations/default/1781537795232_crashes_incident_link/up.sql

CREATE OR REPLACE VIEW vz_incident_records_view AS
SELECT
    c.vz_incident_id,
    'crash'::text     AS record_type,
    agency.label      AS record_responding_agency,
    c.id              AS record_id,
    c.case_id         AS record_incident_number,
    c.crash_timestamp AS record_timestamp,
    c.address_display AS record_address,
    c."position"      AS geom
FROM crashes c
LEFT JOIN lookups.agency agency ON agency.id = c.investigat_agency_id
WHERE c.vz_incident_id IS NOT NULL AND c.is_deleted IS FALSE
UNION ALL
SELECT
    ci.vz_incident_id,
    'cad_incident'::text      AS record_type,
    ci.agency_type_short      AS record_responding_agency,
    ci.id                     AS record_id,
    ci.master_incident_number AS record_incident_number,
    ci.response_date          AS record_timestamp,
    ci.address                AS record_address,
    ci.geom
FROM cad_incidents ci
WHERE ci.vz_incident_id IS NOT NULL;
