select 0;

-- -- revert view changes
-- CREATE OR REPLACE VIEW public.vz_incident_records_view AS
--     SELECT
--         c.vz_incident_id,
--         'crash'::text        AS record_type,
--         agency.label         AS record_responding_agency,
--         c.id                 AS record_id,
--         c.case_id            AS record_incident_number,
--         c.crash_timestamp    AS record_timestamp,
--         c.address_display    AS record_address,
--         c.position           AS geom
--     FROM crashes c
--         LEFT JOIN lookups.agency agency on agency.id = c.investigat_agency_id
--     WHERE c.vz_incident_id IS NOT NULL and c.is_deleted is false
--     UNION ALL
--     SELECT
--         ci.vz_incident_id,
--         'cad_incident'::text        AS record_type,
--         ci.agency_type_short        AS record_responding_agency,
--         ci.id                       AS record_id,
--         ci.master_incident_number   AS record_incident_number,
--         ci.response_date            AS record_timestamp,
--         ci.address                  AS record_address,
--         ci.geom                     AS geom
--     FROM cad_incidents ci
--     WHERE ci.vz_incident_id IS NOT NULL;

-- COMMENT ON VIEW public.vz_incident_records_view IS 'Unified view of records (crashes, cad_incidents) belonging to a vz_incident, exposed under a common schema for cross-type queries and geo-temporal matching.';

-- DROP TRIGGER IF EXISTS ems_incidents_trigger_vz_incident_match_insert ON public.ems__incidents;

-- DROP FUNCTION if exists public.ems_match_vz_incident;

-- ALTER TABLE ems__incidents
--     drop COLUMN vz_incident_id,
--     drop COLUMN vz_incident_match_status,
--     drop COLUMN vz_incident_matched_ids;
