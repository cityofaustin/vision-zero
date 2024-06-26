
create or replace view locations_list_view as (
    with crash_totals as (
        with unioned_crash_counts as (
            with cr3_crash_counts as (
                select
                    location_id,
                    sus_serious_injry_count,
                  vz_fatality_count,
                  est_comp_cost_crash_based
                from
                    crashes_list_view
                where
                    crashes_list_view.private_dr_fl = false
                    and crashes_list_view.location_id is not null
                    and crashes_list_view.crash_date
                    > (now() - '5 years'::interval)
            ),

            non_cr3_crash_counts as (
                select
                    location_id,
                    0 as vz_fatality_count,
                    0 as sus_serious_injry_count,
                    est_comp_cost as est_comp_cost_crash_based
                from atd_apd_blueform as non_cr3_crash_counts
                where
                    true
                    and non_cr3_crash_counts.location_id is not null
                    and non_cr3_crash_counts.date
                    > (now() - '5 years'::interval)
            )

            select * from cr3_crash_counts
            union all
            select * from non_cr3_crash_counts
        )

        select
            location_id,
            count(unioned_crash_counts.*) as crash_count,
            sum(
                unioned_crash_counts.sus_serious_injry_count
            ) as sus_serious_injry_count,
            sum(unioned_crash_counts.vz_fatality_count) as vz_fatality_count,
            sum(unioned_crash_counts.est_comp_cost_crash_based) as total_est_comp_cost
        from
            unioned_crash_counts
        group by location_id
    )

    select
        locations.location_id,
        locations.description,
        coalesce(crash_totals.crash_count, 0) as crash_count,
        coalesce(crash_totals.sus_serious_injry_count, 0) as sus_serious_injry_count,
        coalesce(crash_totals.vz_fatality_count, 0) as vz_fatality_count,
        coalesce(crash_totals.total_est_comp_cost, 0)
    from atd_txdot_locations as locations
    left join crash_totals on locations.location_id = crash_totals.location_id
    where locations.council_district > 0 and locations.location_group = 1
);
