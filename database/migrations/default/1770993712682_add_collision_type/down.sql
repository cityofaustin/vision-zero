-- Recreate socrata export crashes view without collision type
create or replace view public.socrata_export_crashes_view as
with unit_aggregates as (
    select
        crashes_1.id,
        string_agg(
            distinct mode_categories.label, ' & '::text
        ) as units_involved
    from crashes as crashes_1
    left join units on crashes_1.id = units.crash_pk
    left join
        lookups.mode_category as mode_categories
        on units.vz_mode_category_id = mode_categories.id
    group by crashes_1.id
)
select
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
    cimv.crash_injry_sev_id as crash_sev_id,
    cimv.sus_serious_injry_count as sus_serious_injry_cnt,
    cimv.nonincap_injry_count as nonincap_injry_cnt,
    cimv.poss_injry_count as poss_injry_cnt,
    cimv.non_injry_count as non_injry_cnt,
    cimv.unkn_injry_count as unkn_injry_cnt,
    cimv.tot_injry_count as tot_injry_cnt,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost,
    cimv.law_enf_fatality_count,
    cimv.vz_fatality_count as death_cnt,
    crashes.onsys_fl,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    cimv.motor_vehicle_fatality_count as motor_vehicle_death_count,
    cimv.motor_vehicle_sus_serious_injry_count as motor_vehicle_serious_injury_count,
    cimv.bicycle_fatality_count as bicycle_death_count,
    cimv.bicycle_sus_serious_injry_count as bicycle_serious_injury_count,
    cimv.pedestrian_fatality_count as pedestrian_death_count,
    cimv.pedestrian_sus_serious_injry_count as pedestrian_serious_injury_count,
    cimv.motorcycle_fatality_count as motorcycle_death_count,
    cimv.motorcycle_sus_serious_count as motorcycle_serious_injury_count,
    cimv.micromobility_fatality_count as micromobility_death_count,
    cimv.micromobility_sus_serious_injry_count as micromobility_serious_injury_count,
    cimv.other_fatality_count as other_death_count,
    cimv.other_sus_serious_injry_count as other_serious_injury_count,
    cimv.years_of_life_lost,
    to_char(
        crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) as crash_timestamp,
    to_char(
        (crashes.crash_timestamp at time zone 'US/Central'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) as crash_timestamp_ct,
    case
        when
            crashes.latitude is not NULL and crashes.longitude is not NULL
            then
                (
                    (('POINT ('::text || crashes.longitude::text) || ' '::text)
                    || crashes.latitude::text
                )
                || ')'::text
        else NULL::text
    end as point,
    coalesce(cimv.crash_injry_sev_id = 4, FALSE) as crash_fatal_fl
from crashes
left join lateral (select
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
from crash_injury_metrics_view
where crashes.id = crash_injury_metrics_view.id
limit 1) as cimv on TRUE
left join lateral (select
    unit_aggregates_1.id,
    unit_aggregates_1.units_involved
from unit_aggregates as unit_aggregates_1
where crashes.id = unit_aggregates_1.id
limit 1) as unit_aggregates on TRUE
left join
    locations as location
    on crashes.location_id = location.location_id
where
    crashes.is_deleted = FALSE
    and crashes.in_austin_full_purpose = TRUE
    and crashes.private_dr_fl = FALSE
    and crashes.crash_timestamp < (now() - '14 days'::interval)
order by crashes.id;
