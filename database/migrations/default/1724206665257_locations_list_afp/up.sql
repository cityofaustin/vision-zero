drop view if exists locations_list_view;
create view locations_list_view as
with cr3_comp_costs as (
    select
        location_id,
        sum(est_comp_cost_crash_based) as cr3_comp_costs_total
    from crashes_list_view group by location_id
),

cr3_crash_counts as (
    select
        location_id,
        count(location_id) as crash_count
    from
        crashes
    where
        crashes.private_dr_fl = false
        and crashes.location_id is not null
        and crashes.crash_timestamp > (now() - '5 years'::interval)
    group by
        location_id
),

non_cr3_crash_counts as (
    select
        location_id,
        count(location_id) as crash_count,
        count(location_id) * 10000 as noncr3_comp_costs_total
    from
        atd_apd_blueform
    where
        atd_apd_blueform.location_id is not null
        and atd_apd_blueform.date > (now() - '5 years'::interval)
    group by
        location_id
)

select
    locations.location_id,
    locations.description,
    locations.council_district,
    locations.location_group,
    coalesce(
        cr3_comp_costs.cr3_comp_costs_total
        + non_cr3_crash_counts.noncr3_comp_costs_total,
        0
    ) as total_est_comp_cost,
    coalesce(cr3_crash_counts.crash_count, 0) as cr3_crash_count,
    coalesce(non_cr3_crash_counts.crash_count, 0) as non_cr3_crash_count,
    coalesce(cr3_crash_counts.crash_count, 0)
    + coalesce(non_cr3_crash_counts.crash_count, 0) as crash_count
from
    atd_txdot_locations as locations
left join
    cr3_crash_counts
    on locations.location_id = cr3_crash_counts.location_id
left join
    non_cr3_crash_counts
    on locations.location_id = non_cr3_crash_counts.location_id
left join cr3_comp_costs on locations.location_id = cr3_comp_costs.location_id;
