-- Most recent migration: database/migrations/default/1787848628285_ems_crash_list_view/up.sql

CREATE OR REPLACE VIEW crashes_ems_list_view AS
SELECT
    'crashes_'::text
    || crashes.id::text       AS record_id,
    'crashes'::text           AS record_table_name,
    crashes.record_locator,
    crashes.case_id,
    '/crashes/'::text
    || crashes.record_locator AS details_page,
    CASE
        WHEN crashes.investigat_agency_id = 74 THEN 'apd'::text
        ELSE agency.label
    END                       AS record_responding_agency,
    crashes.crash_timestamp   AS record_timestamp,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD'::text
    )                         AS record_date_ct,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'HH24:MI:SS'::text
    )                         AS record_time_ct,
    upper(
        to_char((crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'dy'::text)
    )                         AS record_day_of_week,
    crashes.address_display   AS record_address,
    crashes.latitude,
    crashes.longitude,
    crashes.location_id,
    crashes.in_austin_full_purpose,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    CASE
        WHEN cimv.matched_person_count > 0 THEN true
        ELSE false
    END                       AS has_ems_override,
    CASE
        WHEN
            cimv.unmatched_serious_or_fatal_count = 0
            OR cimv.unmatched_serious_or_fatal_count IS null
            THEN 'fully_matched'::text
        WHEN
            cimv.matched_person_count = 0 OR cimv.matched_person_count IS null
            THEN 'unmatched'::text
        ELSE 'mixed'::text
    END                       AS injured_people_match_status,
    cimv.upgrade_to_sus_serious_injry_count,
    cimv.downgrade_from_sus_serious_injry,
    cimv.unkn_injry_count,
    cimv.nonincap_injry_count,
    cimv.poss_injry_count,
    cimv.non_injry_count,
    cimv.sus_serious_injry_count,
    cimv.tot_injry_count,
    cimv.fatality_count,
    cimv.vz_fatality_count,
    cimv.law_enf_fatality_count,
    cimv.cris_fatality_count,
    cimv.motor_vehicle_fatality_count,
    cimv.motor_vehicle_sus_serious_injry_count,
    cimv.motorcycle_fatality_count,
    cimv.motorcycle_sus_serious_count,
    cimv.bicycle_fatality_count,
    cimv.bicycle_sus_serious_injry_count,
    cimv.pedestrian_fatality_count,
    cimv.pedestrian_sus_serious_injry_count,
    cimv.micromobility_fatality_count,
    cimv.micromobility_sus_serious_injry_count,
    cimv.other_fatality_count,
    cimv.other_sus_serious_injry_count,
    cimv.crash_injry_sev_id,
    injry_sev.label           AS crash_injry_sev_desc,
    cimv.years_of_life_lost,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost
FROM crashes
LEFT JOIN combined_crash_injury_metrics_view cimv ON crashes.id = cimv.id
LEFT JOIN crash_unit_aggregates_view unit_aggregates ON crashes.id = unit_aggregates.id
LEFT JOIN lookups.agency ON crashes.investigat_agency_id = agency.id
LEFT JOIN lookups.injry_sev ON cimv.crash_injry_sev_id = injry_sev.id
WHERE crashes.is_deleted = false
UNION ALL
SELECT
    'ems__incidents_'::text
    || ei.incident_number         AS record_id,
    'ems__incidents'::text        AS record_table_name,
    ei.incident_number            AS record_locator,
    ei.incident_number            AS case_id,
    '/ems/'::text
    || ei.incident_number         AS details_page,
    'ems'::text                   AS record_responding_agency,
    ei.incident_received_datetime AS record_timestamp,
    to_char(
        (ei.incident_received_datetime AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD'::text
    )                             AS record_date_ct,
    to_char(
        (ei.incident_received_datetime AT TIME ZONE 'America/Chicago'::text), 'HH24:MI:SS'::text
    )                             AS record_time_ct,
    upper(
        to_char((ei.incident_received_datetime AT TIME ZONE 'America/Chicago'::text), 'dy'::text)
    )                             AS record_day_of_week,
    ei.incident_location_address  AS record_address,
    ei.latitude,
    ei.longitude,
    ei.location_id,
    ei.austin_full_purpose        AS in_austin_full_purpose,
    null::boolean                 AS private_dr_fl,
    ei.units_involved,
    false                         AS has_ems_override,
    'unmatched'::text             AS injured_people_match_status,
    0                             AS upgrade_to_sus_serious_injry_count,
    0                             AS downgrade_from_sus_serious_injry,
    ei.unkn_injry_count,
    ei.nonincap_injry_count,
    ei.poss_injry_count,
    ei.non_injry_count,
    ei.sus_serious_injry_count,
    ei.tot_injry_count,
    ei.fatality_count,
    ei.vz_fatality_count,
    null::bigint                  AS law_enf_fatality_count,
    null::bigint                  AS cris_fatality_count,
    ei.motor_vehicle_fatality_count,
    ei.motor_vehicle_sus_serious_injry_count,
    ei.motorcycle_fatality_count,
    ei.motorcycle_sus_serious_count,
    ei.bicycle_fatality_count,
    ei.bicycle_sus_serious_injry_count,
    ei.pedestrian_fatality_count,
    ei.pedestrian_sus_serious_injry_count,
    ei.micromobility_fatality_count,
    ei.micromobility_sus_serious_injry_count,
    ei.other_fatality_count,
    ei.other_sus_serious_injry_count,
    ei.crash_injry_sev_id,
    injry_sev.label               AS crash_injry_sev_desc,
    ei.years_of_life_lost,
    ei.est_comp_cost_crash_based,
    ei.est_total_person_comp_cost
FROM ems_unmatched_incident_injury_metrics_view ei
LEFT JOIN lookups.injry_sev ON ei.crash_injry_sev_id = injry_sev.id
ORDER BY 7 DESC;
