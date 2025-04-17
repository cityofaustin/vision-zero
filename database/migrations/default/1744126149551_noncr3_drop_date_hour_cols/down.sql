drop materialized view location_crashes_view;
drop view locations_list_view;

alter table atd_apd_blueform add column date date,
add column hour integer,
drop column case_timestamp;

drop trigger if exists remove_dupe_non_cr3s_insert_update_trigger on atd_apd_blueform;
drop function if exists remove_dupe_non_cr3s;

alter table ems__incidents drop column atd_apd_blueform_case_id;
alter table atd_apd_blueform drop column is_deleted,
drop column created_at,
drop column updated_at;
drop trigger set_public_atd_apd_blueform_updated_at on public.atd_apd_blueform;

drop index crashes_case_id_investigat_agency_id_idx;


--
-- restore location_crashes_view
--
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
        and crashes.crash_timestamp >= (now() - '5 years'::interval)::date
    union all
    select
        null::text as record_locator,
        aab.form_id as cris_crash_id,
        'NON-CR3'::text as type,
        aab.location_id,
        aab.case_id::text as case_id,
        (
            (
                (
                    aab.date + make_interval(hours => aab.hour)
                ) at time zone 'America/Chicago'::text
            ) at time zone 'UTC'::text
        )::timestamp with time zone as crash_timestamp,
        aab.date::text as crash_date,
        concat(aab.hour, ':00:00') as crash_time,
        (
            select
                case date_part('dow'::text, aab.date)
                    when 0 then 'SUN'::text
                    when 1 then 'MON'::text
                    when 2 then 'TUE'::text
                    when 3 then 'WED'::text
                    when 4 then 'THU'::text
                    when 5 then 'FRI'::text
                    when 6 then 'SAT'::text
                    else 'Unknown'::text
                end as "case"
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
    where aab.date >= (now() - '5 years'::interval)::date
);

create index on location_crashes_view (location_id);
create index on location_crashes_view (record_locator);
create index on location_crashes_view (crash_timestamp);


--
-- restore locations_list_view
--
create view locations_list_view as
with cr3_comp_costs as (
    select
        crashes_list_view.location_id,
        sum(crashes_list_view.est_comp_cost_crash_based) as cr3_comp_costs_total
    from crashes_list_view
    where crashes_list_view.crash_timestamp > (now() - '5 years'::interval)
    group by crashes_list_view.location_id
),

cr3_crash_counts as (
    select
        crashes.location_id,
        count(crashes.location_id) as crash_count
    from crashes
    where
        crashes.private_dr_fl = false
        and crashes.location_id is not null
        and crashes.crash_timestamp > (now() - '5 years'::interval)
    group by crashes.location_id
),

non_cr3_crash_counts as (
    select
        atd_apd_blueform.location_id,
        count(atd_apd_blueform.location_id) as crash_count,
        count(atd_apd_blueform.location_id) * 10000 as noncr3_comp_costs_total
    from atd_apd_blueform
    where
        atd_apd_blueform.location_id is not null
        and atd_apd_blueform.date > (now() - '5 years'::interval)
    group by atd_apd_blueform.location_id
)

select
    locations.location_id,
    locations.description,
    locations.council_district,
    locations.location_group,
    coalesce(
        cr3_comp_costs.cr3_comp_costs_total
        + non_cr3_crash_counts.noncr3_comp_costs_total,
        0::bigint
    ) as total_est_comp_cost,
    coalesce(cr3_crash_counts.crash_count, 0::bigint) as cr3_crash_count,
    coalesce(
        non_cr3_crash_counts.crash_count, 0::bigint
    ) as non_cr3_crash_count,
    coalesce(cr3_crash_counts.crash_count, 0::bigint)
    + coalesce(non_cr3_crash_counts.crash_count, 0::bigint) as crash_count
from atd_txdot_locations as locations
left join
    cr3_crash_counts
    on locations.location_id::text = cr3_crash_counts.location_id
left join
    non_cr3_crash_counts
    on locations.location_id::text = non_cr3_crash_counts.location_id::text
left join
    cr3_comp_costs
    on locations.location_id::text = cr3_comp_costs.location_id;
