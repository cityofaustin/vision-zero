-- Most recent migration: database/migrations/default/1783347751354_vz_incidents_view/up.sql

DROP MATERIALIZED VIEW IF EXISTS vz_incidents_view;

CREATE MATERIALIZED VIEW vz_incidents_view AS
SELECT
    id,
    record_count,
    incident_numbers,
    ('$'::text || array_to_string(incident_numbers, '$,$'::text))
    || '$'::text                                                            AS incident_numbers_str,
    record_tables,
    ('$'::text || array_to_string(record_tables, '$,$'::text)) || '$'::text AS record_tables_str,
    responding_agencies,
    ('$'::text || array_to_string(responding_agencies, '$,$'::text))
    || '$'::text                                                            AS responding_agencies_str,
    address,
    location_ids,
    record_timestamp,
    point_feature,
    latitude,
    longitude,
    in_austin_full_purpose
FROM (SELECT
    v.vz_incident_id AS id,
    count(
        *
    )                AS record_count,
    nullif(
        array_agg(
            DISTINCT v.record_incident_number
            ORDER BY v.record_incident_number
        ) FILTER (WHERE v.record_incident_number IS NOT NULL
        ), ARRAY[]::text []
    )                AS incident_numbers,
    nullif(
        array_agg(
            DISTINCT v.record_table_name
            ORDER BY v.record_table_name
        ) FILTER (WHERE v.record_table_name IS NOT NULL
        ), ARRAY[]::text []
    )                AS record_tables,
    nullif(
        array_agg(
            DISTINCT v.record_responding_agency
            ORDER BY v.record_responding_agency
        ) FILTER (WHERE v.record_responding_agency IS NOT NULL
        ), ARRAY[]::text []
    )                AS responding_agencies,
    (
        array_remove(array_agg(
            v.record_address
            ORDER BY v.is_location_reviewed DESC, v.record_timestamp ASC, v.record_id ASC
        ), NULL::text)
    )[1]             AS address,
    nullif(
        array_agg(
            DISTINCT v.location_id
            ORDER BY v.location_id
        ) FILTER (WHERE v.location_id IS NOT NULL
        ), ARRAY[]::text []
    )                AS location_ids,
    min(
        v.record_timestamp
    )                AS record_timestamp,
    (
        array_remove(array_agg(
            v.geom
            ORDER BY v.is_location_reviewed DESC, v.record_timestamp ASC, v.record_id ASC
        ), NULL::geometry)
    )[1]             AS point_feature,
    (
        array_remove(array_agg(
            v.latitude
            ORDER BY v.is_location_reviewed DESC, v.record_timestamp ASC, v.record_id ASC
        ), NULL::double precision)
    )[1]             AS latitude,
    (
        array_remove(array_agg(
            v.longitude
            ORDER BY v.is_location_reviewed DESC, v.record_timestamp ASC, v.record_id ASC
        ), NULL::double precision)
    )[1]             AS longitude,
    bool_or(
        v.in_austin_full_purpose
    )                AS in_austin_full_purpose
FROM vz_incident_records_view v
WHERE v.vz_incident_id IS NOT NULL
GROUP BY v.vz_incident_id) sub;
