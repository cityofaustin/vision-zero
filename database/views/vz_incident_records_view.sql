-- Most recent migration: database/migrations/default/1782228387810_redux/up.sql

CREATE OR REPLACE VIEW vz_incident_records_view AS
SELECT
    'crashes'::text   AS record_table_name,
    agency.label      AS record_responding_agency,
    c.id              AS record_id,
    c.case_id         AS record_incident_number,
    c.crash_timestamp AS record_timestamp,
    c.address_display AS record_address,
    c."position"      AS geom,
    c.vz_incident_id,
    c.vz_incident_match_status
FROM crashes c
LEFT JOIN lookups.agency agency ON agency.id = c.investigat_agency_id
WHERE c.is_deleted IS FALSE
UNION ALL
SELECT
    'cad_incidents'::text     AS record_table_name,
    ci.agency_type_short      AS record_responding_agency,
    ci.id                     AS record_id,
    ci.master_incident_number AS record_incident_number,
    ci.response_date          AS record_timestamp,
    ci.address                AS record_address,
    ci.geom,
    ci.vz_incident_id,
    ci.vz_incident_match_status
FROM cad_incidents ci
UNION ALL
SELECT
    'ems__incidents'::text         AS record_table_name,
    'ems'::text                    AS record_responding_agency,
    ems.id                         AS record_id,
    ems.incident_number            AS record_incident_number,
    ems.incident_received_datetime AS record_timestamp,
    ems.incident_location_address  AS record_address,
    ems.geometry                   AS geom,
    ems.vz_incident_id,
    ems.vz_incident_match_status
FROM ems__incidents ems
WHERE ems.is_deleted IS FALSE
UNION ALL
SELECT
    'afd__incidents'::text    AS record_table_name,
    'afd'::text               AS record_responding_agency,
    afd.id                    AS record_id,
    afd.incident_number::text AS record_incident_number,
    afd.call_datetime         AS record_timestamp,
    afd.address               AS record_address,
    afd.geometry              AS geom,
    afd.vz_incident_id,
    afd.vz_incident_match_status
FROM afd__incidents afd;
