-- crashes_list_view
CREATE OR REPLACE VIEW crashes_list_view AS
WITH geocode_status AS (
    SELECT
        cris.id,
        unified.latitude IS NOT NULL
        AND unified.latitude IS DISTINCT FROM cris.latitude
        OR unified.longitude IS NOT NULL
        AND unified.longitude IS DISTINCT FROM cris.longitude AS is_manual_geocode
    FROM crashes_cris cris
    LEFT JOIN crashes unified ON cris.id = unified.id
)
SELECT
    crashes.id,
    crashes.cris_crash_id,
    crashes.record_locator,
    crashes.case_id,
    crashes.crash_timestamp,
    crashes.address_display,
    crashes.private_dr_fl,
    crashes.in_austin_full_purpose,
    crashes.location_id,
    crashes.rpt_block_num,
    crashes.rpt_street_pfx,
    crashes.rpt_street_sfx,
    crashes.rpt_street_name,
    crashes.rpt_sec_block_num,
    crashes.rpt_sec_street_pfx,
    crashes.rpt_sec_street_sfx,
    crashes.rpt_sec_street_name,
    crashes.latitude,
    crashes.longitude,
    crashes.light_cond_id,
    crashes.wthr_cond_id,
    crashes.active_school_zone_fl,
    crashes.schl_bus_fl,
    crashes.at_intrsct_fl,
    crashes.onsys_fl,
    crashes.traffic_cntl_id,
    crashes.road_constr_zone_fl,
    crashes.rr_relat_fl,
    crashes.toll_road_fl,
    crashes.intrsct_relat_id,
    crashes.obj_struck_id,
    crashes.crash_speed_limit,
    crashes.council_district,
    crashes.is_temp_record,
    crashes.is_coa_roadway,
    crash_injury_metrics_view.nonincap_injry_count,
    crash_injury_metrics_view.poss_injry_count,
    crash_injury_metrics_view.sus_serious_injry_count,
    crash_injury_metrics_view.non_injry_count,
    crash_injury_metrics_view.tot_injry_count,
    crash_injury_metrics_view.vz_fatality_count,
    crash_injury_metrics_view.cris_fatality_count,
    crash_injury_metrics_view.law_enf_fatality_count,
    crash_injury_metrics_view.fatality_count,
    crash_injury_metrics_view.unkn_injry_count,
    crash_injury_metrics_view.est_comp_cost_crash_based,
    crash_injury_metrics_view.est_total_person_comp_cost,
    crash_injury_metrics_view.crash_injry_sev_id,
    crash_injury_metrics_view.years_of_life_lost,
    injry_sev.label AS crash_injry_sev_desc,
    collsn.label AS collsn_desc,
    geocode_status.is_manual_geocode,
    to_char(
        crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text,
        'YYYY-MM-DD'::text
    ) AS crash_date_ct,
    to_char(
        crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text,
        'HH24:MI:SS'::text
    ) AS crash_time_ct,
    upper(
        to_char(
            crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text,
            'dy'::text
        )
    ) AS crash_day_of_week
FROM crashes
LEFT JOIN LATERAL (
    SELECT
        crash_injury_metrics_view_1.id,
        crash_injury_metrics_view_1.cris_crash_id,
        crash_injury_metrics_view_1.unkn_injry_count,
        crash_injury_metrics_view_1.nonincap_injry_count,
        crash_injury_metrics_view_1.poss_injry_count,
        crash_injury_metrics_view_1.non_injry_count,
        crash_injury_metrics_view_1.sus_serious_injry_count,
        crash_injury_metrics_view_1.tot_injry_count,
        crash_injury_metrics_view_1.fatality_count,
        crash_injury_metrics_view_1.vz_fatality_count,
        crash_injury_metrics_view_1.law_enf_fatality_count,
        crash_injury_metrics_view_1.cris_fatality_count,
        crash_injury_metrics_view_1.motor_vehicle_fatality_count,
        crash_injury_metrics_view_1.motor_vehicle_sus_serious_injry_count,
        crash_injury_metrics_view_1.motorcycle_fatality_count,
        crash_injury_metrics_view_1.motorcycle_sus_serious_count,
        crash_injury_metrics_view_1.bicycle_fatality_count,
        crash_injury_metrics_view_1.bicycle_sus_serious_injry_count,
        crash_injury_metrics_view_1.pedestrian_fatality_count,
        crash_injury_metrics_view_1.pedestrian_sus_serious_injry_count,
        crash_injury_metrics_view_1.micromobility_fatality_count,
        crash_injury_metrics_view_1.micromobility_sus_serious_injry_count,
        crash_injury_metrics_view_1.other_fatality_count,
        crash_injury_metrics_view_1.other_sus_serious_injry_count,
        crash_injury_metrics_view_1.crash_injry_sev_id,
        crash_injury_metrics_view_1.years_of_life_lost,
        crash_injury_metrics_view_1.est_comp_cost_crash_based,
        crash_injury_metrics_view_1.est_total_person_comp_cost
    FROM crash_injury_metrics_view crash_injury_metrics_view_1
    WHERE crashes.id = crash_injury_metrics_view_1.id
    LIMIT 1
) crash_injury_metrics_view ON TRUE
LEFT JOIN geocode_status ON crashes.id = geocode_status.id
LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
LEFT JOIN lookups.injry_sev ON crash_injury_metrics_view.crash_injry_sev_id = injry_sev.id
WHERE crashes.is_deleted = false
ORDER BY crashes.crash_timestamp DESC;

-- fatalities_view
CREATE OR REPLACE VIEW fatalities_view AS
SELECT
    people.id  AS person_id,
    crashes.id AS crash_pk,
    crashes.cris_crash_id,
    crashes.record_locator,
    crashes.longitude,
    crashes.latitude,
    crashes.address_display,
    units.id   AS unit_id,
    concat_ws(
        ' '::text, people.prsn_first_name, people.prsn_mid_name, people.prsn_last_name
    )          AS victim_name,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'yyyy'::text
    )          AS year,
    crashes.crash_timestamp,
    concat_ws(
        ' '::text,
        crashes.rpt_block_num,
        crashes.rpt_street_pfx,
        crashes.rpt_street_name,
        '(',
        crashes.rpt_sec_block_num,
        crashes.rpt_sec_street_pfx,
        crashes.rpt_sec_street_name,
        ')'
    )          AS location,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD'::text
    )          AS crash_date_ct,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'HH24:MI:SS'::text
    )          AS crash_time_ct,
    row_number()
        OVER (
            PARTITION BY
                (extract(YEAR FROM (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text)))
            ORDER BY ((crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text))
        )
    AS ytd_fatality,
    dense_rank()
        OVER (
            PARTITION BY
                (extract(YEAR FROM (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text)))
            ORDER BY ((crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text)), crashes.id
        )
    AS ytd_fatal_crash,
    crashes.case_id,
    crashes.law_enforcement_ytd_fatality_num,
    crashes.engineering_area_id
FROM people
LEFT JOIN units ON people.unit_id = units.id
LEFT JOIN crashes ON units.crash_pk = crashes.id
WHERE
    crashes.in_austin_full_purpose = true AND people.prsn_injry_sev_id = 4 AND crashes.private_dr_fl = false AND crashes.is_deleted = false;

-- socrata_export_people_view
CREATE OR REPLACE VIEW socrata_export_people_view AS
SELECT
    people.id,
    people.unit_id,
    crashes.id                AS crash_pk,
    crashes.cris_crash_id,
    crashes.is_temp_record,
    people.is_deleted,
    people.is_primary_person,
    people.prsn_age,
    people.prsn_gndr_id       AS prsn_sex_id,
    gndr.label                AS prsn_sex_label,
    people.prsn_ethnicity_id,
    drvr_ethncty.label        AS prsn_ethnicity_label,
    people.prsn_injry_sev_id,
    units.vz_mode_category_id AS mode_id,
    mode_categories.label     AS mode_desc,
    to_char(
        crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                         AS crash_timestamp,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                         AS crash_timestamp_ct
FROM people
LEFT JOIN units units ON people.unit_id = units.id
LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
LEFT JOIN lookups.mode_category mode_categories ON units.vz_mode_category_id = mode_categories.id
LEFT JOIN lookups.drvr_ethncty ON people.prsn_ethnicity_id = drvr_ethncty.id
LEFT JOIN lookups.gndr ON people.prsn_gndr_id = gndr.id
WHERE
    people.is_deleted = false AND crashes.in_austin_full_purpose = true AND crashes.private_dr_fl = false AND crashes.is_deleted = false AND crashes.crash_timestamp < (now() - '14 days'::interval) AND (people.prsn_injry_sev_id = 1 OR people.prsn_injry_sev_id = 4);

-- socrata_export_crashes_view
CREATE OR REPLACE VIEW socrata_export_crashes_view AS WITH unit_aggregates AS (
    SELECT
        crashes_1.id,
        string_agg(DISTINCT mode_categories.label, ' & '::text) AS units_involved
    FROM crashes crashes_1
    LEFT JOIN units ON crashes_1.id = units.crash_pk
    LEFT JOIN
        lookups.mode_category mode_categories
        ON units.vz_mode_category_id = mode_categories.id
    GROUP BY crashes_1.id
)

SELECT
    crashes.id,
    crashes.cris_crash_id,
    crashes.case_id,
    crashes.is_deleted,
    crashes.latitude,
    crashes.longitude,
    crashes.address_display,
    crashes.rpt_block_num,
    crashes.rpt_street_name,
    crashes.rpt_street_pfx,
    crashes.rpt_street_sfx,
    location.location_id,
    location.location_group,
    crashes.crash_speed_limit,
    crashes.road_constr_zone_fl,
    crashes.is_temp_record,
    cimv.crash_injry_sev_id                    AS crash_sev_id,
    cimv.sus_serious_injry_count               AS sus_serious_injry_cnt,
    cimv.nonincap_injry_count                  AS nonincap_injry_cnt,
    cimv.poss_injry_count                      AS poss_injry_cnt,
    cimv.non_injry_count                       AS non_injry_cnt,
    cimv.unkn_injry_count                      AS unkn_injry_cnt,
    cimv.tot_injry_count                       AS tot_injry_cnt,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost,
    cimv.law_enf_fatality_count,
    cimv.vz_fatality_count                     AS death_cnt,
    crashes.onsys_fl,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    cimv.motor_vehicle_fatality_count          AS motor_vehicle_death_count,
    cimv.motor_vehicle_sus_serious_injry_count AS motor_vehicle_serious_injury_count,
    cimv.bicycle_fatality_count                AS bicycle_death_count,
    cimv.bicycle_sus_serious_injry_count       AS bicycle_serious_injury_count,
    cimv.pedestrian_fatality_count             AS pedestrian_death_count,
    cimv.pedestrian_sus_serious_injry_count    AS pedestrian_serious_injury_count,
    cimv.motorcycle_fatality_count             AS motorcycle_death_count,
    cimv.motorcycle_sus_serious_count          AS motorcycle_serious_injury_count,
    cimv.micromobility_fatality_count          AS micromobility_death_count,
    cimv.micromobility_sus_serious_injry_count AS micromobility_serious_injury_count,
    cimv.other_fatality_count                  AS other_death_count,
    cimv.other_sus_serious_injry_count         AS other_serious_injury_count,
    cimv.years_of_life_lost,
    to_char(
        crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                                          AS crash_timestamp,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                                          AS crash_timestamp_ct,
    CASE
        WHEN
            crashes.latitude IS NOT NULL AND crashes.longitude IS NOT NULL
            THEN
                (
                    (('POINT ('::text || crashes.longitude::text) || ' '::text)
                    || crashes.latitude::text
                )
                || ')'::text
        ELSE NULL::text
    END                                        AS point,
    coalesce(
        cimv.crash_injry_sev_id = 4, FALSE
    )                                          AS crash_fatal_fl,
    collsn.label                               AS collsn_desc
FROM crashes
LEFT JOIN LATERAL (
    SELECT
        crash_injury_metrics_view.id,
        crash_injury_metrics_view.cris_crash_id,
        crash_injury_metrics_view.unkn_injry_count,
        crash_injury_metrics_view.nonincap_injry_count,
        crash_injury_metrics_view.poss_injry_count,
        crash_injury_metrics_view.non_injry_count,
        crash_injury_metrics_view.sus_serious_injry_count,
        crash_injury_metrics_view.tot_injry_count,
        crash_injury_metrics_view.fatality_count,
        crash_injury_metrics_view.vz_fatality_count,
        crash_injury_metrics_view.law_enf_fatality_count,
        crash_injury_metrics_view.cris_fatality_count,
        crash_injury_metrics_view.motor_vehicle_fatality_count,
        crash_injury_metrics_view.motor_vehicle_sus_serious_injry_count,
        crash_injury_metrics_view.motorcycle_fatality_count,
        crash_injury_metrics_view.motorcycle_sus_serious_count,
        crash_injury_metrics_view.bicycle_fatality_count,
        crash_injury_metrics_view.bicycle_sus_serious_injry_count,
        crash_injury_metrics_view.pedestrian_fatality_count,
        crash_injury_metrics_view.pedestrian_sus_serious_injry_count,
        crash_injury_metrics_view.micromobility_fatality_count,
        crash_injury_metrics_view.micromobility_sus_serious_injry_count,
        crash_injury_metrics_view.other_fatality_count,
        crash_injury_metrics_view.other_sus_serious_injry_count,
        crash_injury_metrics_view.crash_injry_sev_id,
        crash_injury_metrics_view.years_of_life_lost,
        crash_injury_metrics_view.est_comp_cost_crash_based,
        crash_injury_metrics_view.est_total_person_comp_cost
    FROM crash_injury_metrics_view
    WHERE crashes.id = crash_injury_metrics_view.id
    LIMIT 1
) cimv ON TRUE
LEFT JOIN LATERAL (
    SELECT
        unit_aggregates_1.id,
        unit_aggregates_1.units_involved
    FROM unit_aggregates unit_aggregates_1
    WHERE crashes.id = unit_aggregates_1.id
    LIMIT 1
) unit_aggregates ON TRUE
LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
LEFT JOIN locations location ON crashes.location_id = location.location_id::text
WHERE
    crashes.is_deleted = FALSE
    AND crashes.in_austin_full_purpose = TRUE
    AND crashes.private_dr_fl = FALSE
    AND crashes.crash_timestamp < (now() - '14 days'::interval)
ORDER BY crashes.id;

-- location_crashes_view (materialized; dropped/recreated last)
DROP MATERIALIZED VIEW IF EXISTS location_crashes_view;

CREATE MATERIALIZED VIEW location_crashes_view AS
SELECT
    crashes.record_locator,
    crashes.cris_crash_id,
    crashes.id                                   AS crash_pk,
    'CR3'::text                                  AS type,
    crashes.location_id,
    crashes.case_id,
    crashes.crash_timestamp,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD'::text
    )                                            AS crash_date,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'HH24:MI:SS'::text
    )                                            AS crash_time,
    upper(
        to_char((crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'dy'::text)
    )                                            AS day_of_week,
    crash_injury_metrics_view.crash_injry_sev_id AS crash_sev_id,
    crashes.latitude,
    crashes.longitude,
    crashes.address_display,
    crash_injury_metrics_view.non_injry_count,
    crash_injury_metrics_view.nonincap_injry_count,
    crash_injury_metrics_view.poss_injry_count,
    crash_injury_metrics_view.sus_serious_injry_count,
    crash_injury_metrics_view.tot_injry_count,
    crash_injury_metrics_view.unkn_injry_count,
    crash_injury_metrics_view.vz_fatality_count,
    crash_injury_metrics_view.est_comp_cost_crash_based,
    collsn.label                                 AS collsn_desc,
    crash_units.movement_desc,
    crash_units.travel_direction,
    crash_units.veh_body_styl_desc,
    crash_units.veh_unit_desc
FROM crashes
LEFT JOIN LATERAL (
    SELECT
        units.crash_pk,
        string_agg(movt.label, ','::text)          AS movement_desc,
        string_agg(trvl_dir.label, ','::text)      AS travel_direction,
        string_agg(veh_body_styl.label, ','::text) AS veh_body_styl_desc,
        string_agg(unit_desc.label, ','::text)     AS veh_unit_desc
    FROM units
    LEFT JOIN lookups.movt movt ON units.movement_id = movt.id
    LEFT JOIN lookups.trvl_dir trvl_dir ON units.veh_trvl_dir_id = trvl_dir.id
    LEFT JOIN lookups.veh_body_styl veh_body_styl ON units.veh_body_styl_id = veh_body_styl.id
    LEFT JOIN lookups.unit_desc unit_desc ON units.unit_desc_id = unit_desc.id
    WHERE crashes.id = units.crash_pk
    GROUP BY units.crash_pk
) crash_units ON true
LEFT JOIN LATERAL (
    SELECT
        crash_injury_metrics_view_1.id,
        crash_injury_metrics_view_1.cris_crash_id,
        crash_injury_metrics_view_1.unkn_injry_count,
        crash_injury_metrics_view_1.nonincap_injry_count,
        crash_injury_metrics_view_1.poss_injry_count,
        crash_injury_metrics_view_1.non_injry_count,
        crash_injury_metrics_view_1.sus_serious_injry_count,
        crash_injury_metrics_view_1.tot_injry_count,
        crash_injury_metrics_view_1.fatality_count,
        crash_injury_metrics_view_1.vz_fatality_count,
        crash_injury_metrics_view_1.law_enf_fatality_count,
        crash_injury_metrics_view_1.cris_fatality_count,
        crash_injury_metrics_view_1.motor_vehicle_fatality_count,
        crash_injury_metrics_view_1.motor_vehicle_sus_serious_injry_count,
        crash_injury_metrics_view_1.motorcycle_fatality_count,
        crash_injury_metrics_view_1.motorcycle_sus_serious_count,
        crash_injury_metrics_view_1.bicycle_fatality_count,
        crash_injury_metrics_view_1.bicycle_sus_serious_injry_count,
        crash_injury_metrics_view_1.pedestrian_fatality_count,
        crash_injury_metrics_view_1.pedestrian_sus_serious_injry_count,
        crash_injury_metrics_view_1.micromobility_fatality_count,
        crash_injury_metrics_view_1.micromobility_sus_serious_injry_count,
        crash_injury_metrics_view_1.other_fatality_count,
        crash_injury_metrics_view_1.other_sus_serious_injry_count,
        crash_injury_metrics_view_1.crash_injry_sev_id,
        crash_injury_metrics_view_1.years_of_life_lost,
        crash_injury_metrics_view_1.est_comp_cost_crash_based,
        crash_injury_metrics_view_1.est_total_person_comp_cost
    FROM crash_injury_metrics_view crash_injury_metrics_view_1
    WHERE crashes.id = crash_injury_metrics_view_1.id
    LIMIT 1
) crash_injury_metrics_view ON true
LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
WHERE crashes.is_deleted = false
UNION ALL
SELECT
    null::text                                                                        AS record_locator,
    aab.form_id                                                                       AS cris_crash_id,
    null::integer                                                                     AS crash_pk,
    'NON-CR3'::text                                                                   AS type,
    aab.location_id,
    aab.case_id::text                                                                 AS case_id,
    aab.case_timestamp                                                                AS crash_timestamp,
    to_char((aab.case_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD'::text) AS crash_date,
    to_char((aab.case_timestamp AT TIME ZONE 'America/Chicago'::text), 'HH24:MI:SS'::text) AS crash_time,
    upper(
        to_char((aab.case_timestamp AT TIME ZONE 'America/Chicago'::text), 'dy'::text)
    )                                                                                 AS day_of_week,
    0                                                                                 AS crash_sev_id,
    aab.latitude,
    aab.longitude,
    aab.address                                                                       AS address_display,
    0                                                                                 AS non_injry_count,
    0                                                                                 AS nonincap_injry_count,
    0                                                                                 AS poss_injry_count,
    0                                                                                 AS sus_serious_injry_count,
    0                                                                                 AS tot_injry_count,
    0                                                                                 AS unkn_injry_count,
    0                                                                                 AS vz_fatality_count,
    aab.est_comp_cost_crash_based,
    ''::text                                                                          AS collsn_desc,
    ''::text                                                                          AS movement_desc,
    ''::text                                                                          AS travel_direction,
    ''::text                                                                          AS veh_body_styl_desc,
    ''::text                                                                          AS veh_unit_desc
FROM atd_apd_blueform aab
WHERE aab.is_deleted = false;
