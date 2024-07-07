create or replace view socrata_export_crashes_view as (
    select
        clv.crash_id,
        clv.crash_date_ct,
        clv.crash_time_ct,
        clv.case_id,
        clv.address_primary, --new column need to add to dataset
        clv.address_secondary, --new column need to add to dataset
        clv.rpt_block_num,
        clv.rpt_street_name,
        clv.rpt_street_sfx,
        clv.crash_speed_limit,
        clv.road_constr_zone_fl,
        -- clv.street_name,
        -- clv.street_name_2,
        clv.crash_injry_sev_id as crash_sev_id,
        clv.sus_serious_injry_count,
        clv.nonincap_injry_count,
        clv.poss_injry_count,
        clv.non_injry_count,
        clv.unkn_injry_count,
        clv.law_enf_fatality_count as apd_confirmed_death_count,
        -- clv.tot_injry_count,
        clv.fatality_count,
        clv.vz_fatality_count, -- new field / need to address naming consistencies wrt to fatality_count, vz_fatality_count, death_count. i think we should use vz_fatality_count in the public dataset
        clv.onsys_fl,
        clv.private_dr_fl,
        clv.units_involved,
        clv.atd_mode_category_metadata,
        -- clv.motor_vehicle_fl,
        clv.motor_vehicle_fatality_count as motor_vehicle_death_count,
        clv.motor_vehicle_sus_serious_injry_count as motor_vehicle_serious_injury_count,
        clv.bicycle_fatality_count as bicycle_death_count,
        clv.bicycle_sus_serious_injry_count as bicycle_serious_injury_count,
        clv.pedestrian_fatality_count as pedestrian_death_count,
        clv.pedestrian_sus_serious_injry_count as pedestrian_serious_injury_count,
        clv.motorcycle_fatality_count as motorcycle_death_count,
        clv.motorcycle_sus_serious_count as motorcycle_serious_injury_count,
        clv.micromobility_fatality_count as micromobility_death_count,
        clv.micromobility_sus_serious_injry_count as micromobility_serious_injury_count,
        clv.other_fatality_count as other_death_count,
        clv.other_sus_serious_injry_count as other_serious_injury_count,
        coalesce(clv.crash_injry_sev_id = 4, false) as crash_fatal_fl,
        clv.law_enf_fatality_count > 0 as apd_confirmed_fatality
    from crashes_list_view as clv
);

