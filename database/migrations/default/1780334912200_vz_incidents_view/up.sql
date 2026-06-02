create or replace view vz_incidents_view as (
SELECT
    v.id AS id,
    COUNT(c.id) AS cad_incident_count,
    ROUND(ST_Length (ST_LongestLine (ST_Collect (c.geom), ST_Collect (c.geom))::geography)::numeric, 1) AS spread_meters,
    ROUND(
        EXTRACT(
            EPOCH
            FROM
                (MAX(c.response_date) - MIN(c.response_date))
        ) / 60.0,
        1
    ) AS time_spread_minutes,
    ARRAY_AGG(master_incident_number) as incident_numbers,
    ARRAY_AGG(DISTINCT agency_type ORDER BY agency_type) AS agencies,
    ARRAY_AGG(DISTINCT address ORDER BY address) as addresses,
    ARRAY_AGG(DISTINCT location_id ORDER BY location_id) as location_ids,
    ARRAY_AGG(DISTINCT call_disposition ORDER BY call_disposition) as call_dispositions,
    ARRAY_AGG(DISTINCT initial_problem ORDER BY initial_problem) as initial_problems,
    ARRAY_AGG(DISTINCT final_problem ORDER BY final_problem) as final_problems,
    MIN(c.response_date) as first_response_date,
    MIN(c.time_first_unit_arrived) as time_first_unit_arrived,
    jsonb_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(ST_Collect(c.geom))::jsonb,
        'properties', '{}'::jsonb
    ) AS incident_points,
    ST_AsGeoJSON(ST_Envelope(ST_Collect(c.geom)))::jsonb AS incident_bbox,
    ST_AsGeoJSON(ST_ConvexHull(ST_Collect(c.geom)))::jsonb AS incident_convex_hull,
    ST_AsGeoJSON(ST_MinimumBoundingCircle(ST_Collect(c.geom)))::jsonb AS incident_bounding_circle,
    ST_AsGeoJSON(ST_Centroid(ST_Collect(c.geom)))::jsonb AS incident_centroid,
    BOOL_OR(c.in_austin_full_purpose) AS in_austin_full_purpose
FROM
    vz_incidents v
    JOIN cad_incidents c ON c.vz_incident_id = v.id
WHERE
    v.is_deleted = FALSE
GROUP BY
    v.id
ORDER BY
    v.id);
