DROP VIEW IF EXISTS vz_incidents_view;
DROP VIEW public.vz_incident_records_view;

-- add in_austin_full_purpose, location_id
CREATE OR REPLACE VIEW public.vz_incident_records_view AS
    SELECT
        
        'crashes'::text            AS record_table_name,
        case when 
            --  'AUSTIN POLICE DEPARTMENT' -> 'apd'
            c.investigat_agency_id = 74
                then 'apd'
            else agency.label
        end                        AS record_responding_agency,
        c.id                       AS record_id,
        c.case_id                  AS record_incident_number,
        c.crash_timestamp          AS record_timestamp,
        c.address_display          AS record_address,
        c.position                 AS geom,
        c.vz_incident_id           AS vz_incident_id,
        c.vz_incident_match_status AS vz_incident_match_status,
        c.in_austin_full_purpose   AS in_austin_full_purpose,
        c.location_id              AS location_id,
        case when c.latitude != cris.latitude or c.longitude != cris.longitude THEN TRUE ELSE FALSE END
                                   AS is_location_reviewed
    FROM crashes c
        LEFT JOIN lookups.agency agency on agency.id = c.investigat_agency_id
        LEFT JOIN crashes_cris cris on c.id = cris.id
    WHERE c.is_deleted is false
    UNION ALL
    SELECT
        'cad_incidents'::text       AS record_table_name,
        ci.agency_type_short        AS record_responding_agency,
        ci.id                       AS record_id,
        ci.master_incident_number   AS record_incident_number,
        ci.response_date            AS record_timestamp,
        ci.address                  AS record_address,
        ci.geom                     AS geom,
        ci.vz_incident_id           AS vz_incident_id,
        ci.vz_incident_match_status AS vz_incident_match_status,
        ci.in_austin_full_purpose   AS in_austin_full_purpose,
        ci.location_id              AS location_id,
        FALSE                       AS is_location_reviewed
    FROM cad_incidents ci
    UNION ALL
    SELECT
        'ems__incidents'::text           AS record_table_name,
        'ems'                            AS record_responding_agency,
        ems.id                           AS record_id,
        ems.incident_number              AS record_incident_number,
        ems.incident_received_datetime   AS record_timestamp,
        ems.incident_location_address    AS record_address,
        ems.geometry                     AS geom,
        ems.vz_incident_id               AS vz_incident_id,
        ems.vz_incident_match_status     AS vz_incident_match_status,
        ems.austin_full_purpose          AS in_austin_full_purpose,
        ems.location_id                  AS location_id,
        FALSE                            AS is_location_reviewed
    FROM ems__incidents ems
    WHERE ems.is_deleted is FALSE
    UNION ALL
    SELECT
        'afd__incidents'::text           AS record_table_name,
        'afd'                            AS record_responding_agency,
        afd.id                           AS record_id,
        afd.incident_number::text        AS record_incident_number,
        afd.call_datetime                AS record_timestamp,
        afd.address                      AS record_address,
        afd.geometry                     AS geom,
        afd.vz_incident_id               AS vz_incident_id,
        afd.vz_incident_match_status     AS vz_incident_match_status,
        afd.austin_full_purpose          AS in_austin_full_purpose,
        afd.location_id                  AS location_id,
        FALSE                            AS is_location_reviewed
    FROM afd__incidents afd;

COMMENT ON VIEW public.vz_incident_records_view IS
    'Unified view of crash-related records (crashes, cad_incidents, ems__incidents, afd__incidents)'
    'exposed under a common schema for cross-type queries and geo-temporal matching.';

CREATE OR REPLACE VIEW vz_incidents_view as (
SELECT
    v.vz_incident_id as id,
    COUNT(*) AS record_count,
    ARRAY_AGG(DISTINCT record_incident_number order by record_incident_number) as incident_numbers,
    ARRAY_AGG(DISTINCT record_table_name ORDER BY record_table_name) as record_tables,
    STRING_AGG(DISTINCT '$' || record_table_name || '$', ',' ORDER BY '$' || record_table_name || '$') AS record_tables_str,
    ARRAY_AGG(DISTINCT record_responding_agency ORDER BY record_responding_agency) AS responding_agencies,
    STRING_AGG(DISTINCT '$' || record_responding_agency || '$', ',' ORDER BY '$' || record_responding_agency || '$') AS responding_agencies_str,
    (ARRAY_REMOVE(ARRAY_AGG(v.record_address ORDER BY is_location_reviewed desc, v.record_timestamp, v.record_id), NULL))[1] AS address,
    ARRAY_AGG(DISTINCT location_id ORDER BY location_id) as location_ids,
    MIN(v.record_timestamp) as record_timestamp,
    (ARRAY_REMOVE(ARRAY_AGG(v.geom ORDER BY is_location_reviewed desc, v.record_timestamp, v.record_id), NULL))[1] AS point_feature,
    BOOL_OR(v.in_austin_full_purpose) AS in_austin_full_purpose
FROM
    vz_incident_records_view v
WHERE
    vz_incident_id is not null
GROUP BY
    v.vz_incident_id
ORDER BY
    MIN(v.record_timestamp) desc);
