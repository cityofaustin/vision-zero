drop view public.socrata_export_crashes_view;

CREATE VIEW public.socrata_export_crashes_view AS
    WITH unit_aggregates AS (
        SELECT
            crashes_1.id,
            string_agg(
                DISTINCT mode_categories.label, ' & '::text
            ) AS units_involved
        FROM crashes AS crashes_1
        LEFT JOIN units ON crashes_1.id = units.crash_pk
        LEFT JOIN
            lookups.mode_category AS mode_categories
            ON units.vz_mode_category_id = mode_categories.id
        GROUP BY crashes_1.id
    )

    SELECT
        crashes.id,
        crashes.active_school_zone_fl,
        crashes.address_primary,
        crashes.address_secondary,
        crashes.apd_sector_id,
        crashes.at_intrsct_fl,
        crashes.case_id,
        crashes.council_district,
        crashes.cr3_processed_at,
        crashes.cr3_stored_fl,
        crashes.crash_speed_limit,
        crashes.created_at,
        crashes.cris_crash_id,
        crashes.engineering_area_id,
        crashes.fhe_collsn_id,
        crashes.in_austin_full_purpose,
        crashes.intrsct_relat_id,
        crashes.investigat_agency_id,
        crashes.is_coa_roadway,
        crashes.is_deleted,
        crashes.is_temp_record,
        crashes.latitude,
        crashes.law_enforcement_ytd_fatality_num,
        crashes.light_cond_id,
        crashes.location_id,
        crashes.longitude,
        crashes.medical_advisory_fl,
        crashes.obj_struck_id,
        crashes.record_locator,
        crashes.road_constr_zone_fl,
        crashes.road_constr_zone_wrkr_fl,
        crashes.rpt_block_num,
        crashes.rpt_city_id,
        crashes.rpt_cris_cnty_id,
        crashes.rpt_hwy_num,
        crashes.rpt_hwy_sfx,
        crashes.rpt_rdwy_sys_id,
        crashes.rpt_ref_mark_dir,
        crashes.rpt_ref_mark_dist_uom,
        crashes.rpt_ref_mark_nbr,
        crashes.rpt_ref_mark_offset_amt,
        crashes.rpt_road_part_id,
        crashes.rpt_sec_block_num,
        crashes.rpt_sec_hwy_num,
        crashes.rpt_sec_hwy_sfx,
        crashes.rpt_sec_rdwy_sys_id,
        crashes.rpt_sec_road_part_id,
        crashes.rpt_sec_street_desc,
        crashes.rpt_sec_street_name,
        crashes.rpt_sec_street_pfx,
        crashes.rpt_sec_street_sfx,
        crashes.rpt_street_desc,
        crashes.rpt_street_name,
        crashes.rpt_street_pfx,
        crashes.rpt_street_sfx,
        crashes.rr_relat_fl,
        crashes.schl_bus_fl,
        crashes.signal_engineer_area_id,
        crashes.surf_cond_id,
        crashes.surf_type_id,
        crashes.thousand_damage_fl,
        crashes.toll_road_fl,
        crashes.traffic_cntl_id,
        crashes.txdot_rptable_fl,
        crashes.updated_at,
        crashes.wthr_cond_id,
        crashes.zipcode,
        cimv.crash_injry_sev_id AS crash_sev_id,
        cimv.sus_serious_injry_count AS sus_serious_injry_cnt,
        cimv.nonincap_injry_count AS nonincap_injry_cnt,
        cimv.poss_injry_count AS poss_injry_cnt,
        cimv.non_injry_count AS non_injry_cnt,
        cimv.unkn_injry_count AS unkn_injry_cnt,
        cimv.tot_injry_count AS tot_injry_cnt,
        cimv.law_enf_fatality_count,
        cimv.vz_fatality_count AS death_cnt,
        crashes.onsys_fl,
        crashes.private_dr_fl,
        unit_aggregates.units_involved,
        cimv.motor_vehicle_fatality_count AS motor_vehicle_death_count,
        cimv.motor_vehicle_sus_serious_injry_count AS motor_vehicle_serious_injury_count,
        cimv.bicycle_fatality_count AS bicycle_death_count,
        cimv.bicycle_sus_serious_injry_count AS bicycle_serious_injury_count,
        cimv.pedestrian_fatality_count AS pedestrian_death_count,
        cimv.pedestrian_sus_serious_injry_count AS pedestrian_serious_injury_count,
        cimv.motorcycle_fatality_count AS motorcycle_death_count,
        cimv.motorcycle_sus_serious_count AS motorcycle_serious_injury_count,
        cimv.micromobility_fatality_count AS micromobility_death_count,
        cimv.micromobility_sus_serious_injry_count AS micromobility_serious_injury_count,
        cimv.other_fatality_count AS other_death_count,
        cimv.other_sus_serious_injry_count AS other_serious_injury_count,
        cimv.years_of_life_lost,
        to_char(
            crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
        ) AS crash_timestamp,
        to_char(
            (crashes.crash_timestamp AT TIME ZONE 'US/Central'::text),
            'YYYY-MM-DD"T"HH24:MI:SS'::text
        ) AS crash_timestamp_ct,
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
        END AS point,
        coalesce(cimv.crash_injry_sev_id = 4, FALSE) AS crash_fatal_fl
    FROM crashes
    LEFT JOIN LATERAL (SELECT
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
    LIMIT 1) AS cimv ON TRUE
    LEFT JOIN LATERAL (SELECT
        unit_aggregates_1.id,
        unit_aggregates_1.units_involved
    FROM unit_aggregates AS unit_aggregates_1
    WHERE crashes.id = unit_aggregates_1.id
    LIMIT 1) AS unit_aggregates ON TRUE
    WHERE
        crashes.is_deleted = FALSE
        AND crashes.in_austin_full_purpose = TRUE
        AND crashes.private_dr_fl = FALSE
        AND crashes.crash_timestamp < (now() - '14 days'::interval)
    ORDER BY crashes.id;
