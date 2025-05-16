drop materialized view location_crashes_view;

create materialized view location_crashes_view as (
    select
        crashes.record_locator,
        crashes.cris_crash_id,
        'CR3'::text as type,
        crashes.location_id,
        crashes.case_id,
        crashes.crash_timestamp,
        to_char(
            (crashes.crash_timestamp at time zone 'US/Central'::text),
            'YYYY-MM-DD'::text
        ) as crash_date,
        to_char(
            (crashes.crash_timestamp at time zone 'US/Central'::text),
            'HH24:MI:SS'::text
        ) as crash_time,
        upper(
            to_char(
                (crashes.crash_timestamp at time zone 'US/Central'::text),
                'dy'::text
            )
        ) as day_of_week,
        crash_injury_metrics_view.crash_injry_sev_id as crash_sev_id,
        crashes.latitude,
        crashes.longitude,
        crashes.address_primary,
        crashes.address_secondary,
        crash_injury_metrics_view.non_injry_count,
        crash_injury_metrics_view.nonincap_injry_count,
        crash_injury_metrics_view.poss_injry_count,
        crash_injury_metrics_view.sus_serious_injry_count,
        crash_injury_metrics_view.tot_injry_count,
        crash_injury_metrics_view.unkn_injry_count,
        crash_injury_metrics_view.vz_fatality_count,
        crash_injury_metrics_view.est_comp_cost_crash_based,
        collsn.label as collsn_desc,
        crash_units.movement_desc,
        crash_units.travel_direction,
        crash_units.veh_body_styl_desc,
        crash_units.veh_unit_desc
    from crashes
    left join lateral (select
        units.crash_pk,
        string_agg(movt.label, ','::text) as movement_desc,
        string_agg(trvl_dir.label, ','::text) as travel_direction,
        string_agg(veh_body_styl.label, ','::text) as veh_body_styl_desc,
        string_agg(unit_desc.label, ','::text) as veh_unit_desc
    from units
    left join lookups.movt as movt on units.movement_id = movt.id
    left join
        lookups.trvl_dir as trvl_dir
        on units.veh_trvl_dir_id = trvl_dir.id
    left join
        lookups.veh_body_styl as veh_body_styl
        on units.veh_body_styl_id = veh_body_styl.id
    left join
        lookups.unit_desc as unit_desc
        on units.unit_desc_id = unit_desc.id
    where crashes.id = units.crash_pk
    group by units.crash_pk) as crash_units on true
    left join lateral (select
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
    from crash_injury_metrics_view as crash_injury_metrics_view_1
    where crashes.id = crash_injury_metrics_view_1.id
    limit 1) as crash_injury_metrics_view on true
    left join lookups.collsn on crashes.fhe_collsn_id = collsn.id
    where
        crashes.is_deleted = false
    union all
    select
        null::text as record_locator,
        aab.form_id as cris_crash_id,
        'NON-CR3'::text as type,
        aab.location_id,
        aab.case_id::text as case_id,
        aab.case_timestamp as crash_timestamp,
        to_char(
            (aab.case_timestamp at time zone 'US/Central'::text),
            'YYYY-MM-DD'::text
        ) as crash_date,
        to_char(
            (aab.case_timestamp at time zone 'US/Central'::text),
            'HH24:MI:SS'::text
        ) as crash_time,
        upper(
            to_char(
                (aab.case_timestamp at time zone 'US/Central'::text), 'dy'::text
            )
        ) as day_of_week,
        0 as crash_sev_id,
        aab.latitude,
        aab.longitude,
        aab.address as address_primary,
        ''::text as address_secondary,
        0 as non_injry_count,
        0 as nonincap_injry_count,
        0 as poss_injry_count,
        0 as sus_serious_injry_count,
        0 as tot_injry_count,
        0 as unkn_injry_count,
        0 as vz_fatality_count,
        aab.est_comp_cost_crash_based,
        ''::text as collsn_desc,
        ''::text as movement_desc,
        ''::text as travel_direction,
        ''::text as veh_body_styl_desc,
        ''::text as veh_unit_desc
    from atd_apd_blueform as aab
    where
        aab.is_deleted = false
);

create index on location_crashes_view (location_id);
create index on location_crashes_view (record_locator);
create index on location_crashes_view (crash_timestamp); 
