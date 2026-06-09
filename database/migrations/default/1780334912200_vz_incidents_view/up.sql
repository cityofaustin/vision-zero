alter table cad_incidents add column agency_type_short text generated always as 
(
    case
      when agency_type = 'AUSTIN PD' then 'apd'
      when agency_type = 'FIRE' then 'afd'
    else 'ems'
    end
) 
stored;

comment on column cad_incidents.agency_type_short is 'The abbreviated name of the responding agency';

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
    ARRAY_AGG(DISTINCT agency_type_short ORDER BY agency_type_short) AS agencies,
    ARRAY_AGG(DISTINCT c.address ORDER BY c.address) as addresses,
    (ARRAY_REMOVE(ARRAY_AGG(c.address ORDER BY c.time_first_unit_arrived, c.response_date, c.id), NULL))[1] AS address_earliest,
    ARRAY_AGG(DISTINCT location_id ORDER BY location_id) as location_ids,
    ARRAY_AGG(DISTINCT call_disposition ORDER BY call_disposition) as call_dispositions,
    ARRAY_AGG(DISTINCT initial_problem ORDER BY initial_problem) as initial_problems,
    ARRAY_AGG(DISTINCT final_problem ORDER BY final_problem) as final_problems,
    MIN(c.response_date) as response_date_earliest,
    MIN(c.time_first_unit_arrived) as time_first_unit_arrived_earliest,
    (ARRAY_REMOVE(ARRAY_AGG(c.geom ORDER BY c.time_first_unit_arrived, c.response_date, c.id), NULL))[1] AS point_feature,
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
