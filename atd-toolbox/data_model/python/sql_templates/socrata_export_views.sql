create or replace view socrata_export_crashes_view as (
    select
        clv.crash_id,
        clv.crash_timestamp, -- new column
        clv.crash_date_ct, -- renamed column
        clv.crash_time_ct, -- renamed column
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
        clv.vz_fatality_count, -- new field / need to address naming inconsistencies wrt to fatality_count, vz_fatality_count, death_count. i think we should use vz_fatality_count in the public dataset
        clv.onsys_fl,
        clv.private_dr_fl,
        clv.units_involved,
        clv.atd_mode_category_metadata, -- i don't like this! we should use a separate units dataset. note that death_count was renamed to vz_death_count
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
    where
        clv.in_austin_full_purpose = true and clv.private_dr_fl = false
        and clv.crash_timestamp < now() - INTERVAL '14 days'
);


create or replace view socrata_export_people_view as (
    select
        people.id as person_id,
        people.unit_id as unit_id, --new column
        clv.crash_id,
        people.is_primary_person as is_drive, --new column
        people.prsn_age,
        people.prsn_gndr_id as prsn_sex_id, --rename from prsn_gndr_id
        lookups.gndr_lkp.label as prsn_sex, -- new column
        people.prsn_ethnicity_id,
        lookups.drvr_ethncty_lkp.label as prsn_ethnicity_label, --new column
        people.prsn_injry_sev_id,
        clv.crash_timestamp, --new column
        clv.crash_date_ct, --rename column
        clv.crash_time_ct, --rename column
        units.vz_mode_category_id as mode_id,
        mode_categories.label as mode_desc
    from people
    left join public.units as units on people.unit_id = units.id
    left join public.crashes_list_view as clv on units.crash_id = clv.id
    left join
        lookups.mode_category_lkp as mode_categories
        on units.vz_mode_category_id = mode_categories.id
    left join
        lookups.drvr_ethncty_lkp
        on people.prsn_ethnicity_id = lookups.drvr_ethncty_lkp.id
    left join
        lookups.gndr_lkp
        on people.prsn_gndr_id = lookups.gndr_lkp.id
    where
        clv.in_austin_full_purpose = true and clv.private_dr_fl = false
        and clv.crash_timestamp < now() - INTERVAL '14 days'
);
