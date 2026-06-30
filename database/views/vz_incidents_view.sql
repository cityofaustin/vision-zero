-- Most recent migration: 

CREATE OR REPLACE VIEW vz_incidents_view AS
SELECT
    v.id,
    count(
        c.id
    )    AS cad_incident_count,
    round(
        st_length(st_longestline(st_collect(c.geom), st_collect(c.geom))::geography)::numeric, 1
    )    AS spread_meters,
    round(
        extract(EPOCH FROM max(c.response_date) - min(c.response_date)) / 60.0, 1
    )    AS time_spread_minutes,
    array_agg(
        c.master_incident_number
    )    AS incident_numbers,
    array_agg(
        DISTINCT c.agency_type_short
        ORDER BY c.agency_type_short
    )    AS agencies,
    array_agg(
        DISTINCT c.address
        ORDER BY c.address
    )    AS addresses,
    (
        array_remove(array_agg(
            c.address
            ORDER BY c.time_first_unit_arrived, c.response_date, c.id
        ), NULL::text)
    )[1] AS address_earliest,
    array_agg(
        DISTINCT c.location_id
        ORDER BY c.location_id
    )    AS location_ids,
    array_agg(
        DISTINCT c.call_disposition
        ORDER BY c.call_disposition
    )    AS call_dispositions,
    array_agg(
        DISTINCT c.initial_problem
        ORDER BY c.initial_problem
    )    AS initial_problems,
    array_agg(
        DISTINCT c.final_problem
        ORDER BY c.final_problem
    )    AS final_problems,
    min(
        c.response_date
    )    AS response_date_earliest,
    min(
        c.time_first_unit_arrived
    )    AS time_first_unit_arrived_earliest,
    (
        array_remove(array_agg(
            c.geom
            ORDER BY c.time_first_unit_arrived, c.response_date, c.id
        ), NULL::geometry)
    )[1] AS point_feature,
    bool_or(
        c.in_austin_full_purpose
    )    AS in_austin_full_purpose
FROM vz_incidents v
INNER JOIN cad_incidents c ON c.vz_incident_id = v.id
WHERE v.is_deleted = FALSE
GROUP BY v.id
ORDER BY v.id;
