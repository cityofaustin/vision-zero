-- Most recent migration: database/migrations/default/1783347751354_vz_incidents_view/up.sql

CREATE OR REPLACE VIEW vz_incidents_view AS
SELECT
    v.vz_incident_id AS id,
    count(
        *
    )                AS record_count,
    array_agg(
        DISTINCT v.record_incident_number
        ORDER BY v.record_incident_number
    )                AS incident_numbers,
    array_agg(
        DISTINCT v.record_table_name
        ORDER BY v.record_table_name
    )                AS record_tables,
    string_agg(
        DISTINCT ('$'::text || v.record_table_name) || '$'::text, ','::text
        ORDER BY (('$'::text || v.record_table_name) || '$'::text)
    )                AS record_tables_str,
    array_agg(
        DISTINCT v.record_responding_agency
        ORDER BY v.record_responding_agency
    )                AS responding_agencies,
    string_agg(
        DISTINCT ('$'::text || v.record_responding_agency) || '$'::text, ','::text
        ORDER BY (('$'::text || v.record_responding_agency) || '$'::text)
    )                AS responding_agencies_str,
    (
        array_remove(array_agg(
            v.record_address
            ORDER BY v.is_location_reviewed DESC, v.record_timestamp ASC, v.record_id ASC
        ), NULL::text)
    )[1]             AS address,
    array_agg(
        DISTINCT v.location_id
        ORDER BY v.location_id
    )                AS location_ids,
    min(v.record_timestamp
    )                AS record_timestamp,
    (
        array_remove(array_agg(
            v.geom
            ORDER BY v.is_location_reviewed DESC, v.record_timestamp ASC, v.record_id ASC
        ), NULL::geometry)
    )[1]             AS point_feature,
    bool_or(v.in_austin_full_purpose
    )                AS in_austin_full_purpose
FROM vz_incident_records_view v
WHERE v.vz_incident_id IS NOT NULL
GROUP BY v.vz_incident_id
ORDER BY (min(record_timestamp)) DESC;
