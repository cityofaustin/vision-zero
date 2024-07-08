create or replace view socrata_export_crashes_view as (
    select
        clv.crash_id,
        clv.case_id,
        clv.address_primary,
        clv.address_secondary,
        clv.latitude,
        clv.longitude,
        clv.rpt_block_num,
        clv.rpt_street_name,
        clv.rpt_street_sfx,
        clv.crash_speed_limit,
        clv.road_constr_zone_fl,
        clv.crash_injry_sev_id as crash_sev_id,
        clv.sus_serious_injry_count as sus_serious_injry_cnt,
        clv.nonincap_injry_count as nonincap_injry_cnt,
        clv.poss_injry_count as poss_injry_cnt,
        clv.non_injry_count as non_injry_cnt,
        clv.unkn_injry_count as unkn_injry_cnt,
        clv.law_enf_fatality_count,
        clv.fatality_count as death_cnt,
        clv.vz_fatality_count,
        clv.onsys_fl,
        -- clv.tot_injry_count, ## not sure this is used anywhere
        -- clv.motor_vehicle_fl, ## i don't like these mode flags and i don't think they're used anywhere
        clv.private_dr_fl,
        clv.units_involved, -- new field / need to address naming inconsistencies wrt to fatality_count, vz_fatality_count, death_count. i think we should use vz_fatality_count in the public dataset
        clv.atd_mode_category_metadata,
        clv.motor_vehicle_fatality_count as motor_vehicle_death_count,
        clv.motor_vehicle_sus_serious_injry_count as motor_vehicle_serious_injury_count,
        clv.bicycle_fatality_count as bicycle_death_count, -- i don't like this! we should use a separate units dataset. note that death_count was renamed to vz_death_count
        clv.bicycle_sus_serious_injry_count as bicycle_serious_injury_count,
        clv.pedestrian_fatality_count as pedestrian_death_count,
        clv.pedestrian_sus_serious_injry_count as pedestrian_serious_injury_count,
        clv.motorcycle_fatality_count as motorcycle_death_count,
        clv.motorcycle_sus_serious_count as motorcycle_serious_injury_count,
        clv.micromobility_fatality_count as micromobility_death_count,
        clv.micromobility_sus_serious_injry_count as micromobility_serious_injury_count,
        clv.other_fatality_count as other_death_count,
        clv.other_sus_serious_injry_count as other_serious_injury_count,
        to_char(
            clv.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'
        ) as crash_timestamp,
        to_char(
            clv.crash_timestamp at time zone 'US/Central',
            'YYYY-MM-DD"T"HH24:MI:SS'
        ) as crash_timestamp_ct,
        case
            when
                clv.latitude is not null and clv.longitude is not null
                then
                    'POINT ('
                    || clv.longitude::text
                    || ' '
                    || clv.latitude::text
                    || ')'
        end as point,
        coalesce(clv.crash_injry_sev_id = 4, false) as crash_fatal_fl
    from crashes_list_view as clv
    where
        clv.in_austin_full_purpose = true and clv.private_dr_fl = false
        and clv.crash_timestamp < now() - interval '14 days'
);


create or replace view socrata_export_people_view as (
    select
        people.id as person_id,
        people.unit_id as unit_id, --new column
        clv.crash_id,
        people.is_primary_person, --new column
        people.prsn_age,
        people.prsn_gndr_id as prsn_sex_id, --rename from prsn_gndr_id
        lookups.gndr_lkp.label as prsn_sex_label, -- new column
        people.prsn_ethnicity_id,
        lookups.drvr_ethncty_lkp.label as prsn_ethnicity_label, --new column
        people.prsn_injry_sev_id,
        units.vz_mode_category_id as mode_id,
        mode_categories.label as mode_desc,
        to_char(
            clv.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'
        ) as crash_timestamp,
        to_char(
            clv.crash_timestamp at time zone 'US/Central',
            'YYYY-MM-DD"T"HH24:MI:SS'
        ) as crash_timestamp_ct
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
        and clv.crash_timestamp < now() - interval '14 days'
);
