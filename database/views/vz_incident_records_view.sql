-- Most recent migration: database/migrations/default/1781725446086_afd_to_vz_incident_links/up.sql

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
WHERE ci.vz_incident_id IS NOT NULL
UNION ALL
SELECT
    ems.vz_incident_id,
    'ems__incidents'::text         AS record_type,
    'ems'::text                    AS record_responding_agency,
    ems.id                         AS record_id,
    ems.incident_number            AS record_incident_number,
    ems.incident_received_datetime AS record_timestamp,
    ems.incident_location_address  AS record_address,
    ems.geometry                   AS geom
FROM ems__incidents ems
WHERE ems.vz_incident_id IS NOT NULL
UNION ALL
SELECT
    afd.vz_incident_id,
    'afd__incidents'::text    AS record_type,
    'afd'::text               AS record_responding_agency,
    afd.id                    AS record_id,
    afd.incident_number::text AS record_incident_number,
    afd.call_datetime         AS record_timestamp,
    afd.address               AS record_address,
    afd.geometry              AS geom
FROM afd__incidents afd
WHERE afd.vz_incident_id IS NOT NULL;
