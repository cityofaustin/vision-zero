CREATE OR REPLACE VIEW locations_list_view AS WITH cr3_comp_costs AS (
    SELECT
        crashes_list_view.location_id,
        sum(crashes_list_view.est_comp_cost_crash_based) AS cr3_comp_costs_total
    FROM crashes_list_view
    WHERE crashes_list_view.crash_timestamp > (now() - '5 years'::interval)
    GROUP BY crashes_list_view.location_id
),

cr3_crash_counts AS (
    SELECT
        crashes.location_id,
        count(crashes.location_id) AS crash_count
    FROM crashes
    WHERE
        crashes.private_dr_fl = false
        AND crashes.location_id IS NOT null
        AND crashes.crash_timestamp > (now() - '5 years'::interval)
    GROUP BY crashes.location_id
),

non_cr3_crash_counts AS (
    SELECT
        atd_apd_blueform.location_id,
        count(atd_apd_blueform.location_id)         AS crash_count,
        count(atd_apd_blueform.location_id) * 10000 AS noncr3_comp_costs_total
    FROM atd_apd_blueform
    WHERE
        atd_apd_blueform.location_id IS NOT null
        AND atd_apd_blueform.is_deleted = false
        AND atd_apd_blueform.case_timestamp > (now() - '5 years'::interval)
    GROUP BY atd_apd_blueform.location_id
)

SELECT
    locations.location_id,
    locations.location_name,
    locations.council_district,
    locations.location_group,
    coalesce(
        cr3_comp_costs.cr3_comp_costs_total + non_cr3_crash_counts.noncr3_comp_costs_total,
        0::bigint
    )                                                       AS total_est_comp_cost,
    coalesce(
        cr3_crash_counts.crash_count, 0::bigint
    )                                                       AS cr3_crash_count,
    coalesce(
        non_cr3_crash_counts.crash_count, 0::bigint
    )                                                       AS non_cr3_crash_count,
    coalesce(cr3_crash_counts.crash_count, 0::bigint)
    + coalesce(non_cr3_crash_counts.crash_count, 0::bigint) AS crash_count
FROM locations
LEFT JOIN cr3_crash_counts ON locations.location_id::text = cr3_crash_counts.location_id
LEFT JOIN
    non_cr3_crash_counts
    ON locations.location_id::text = non_cr3_crash_counts.location_id::text
LEFT JOIN cr3_comp_costs ON locations.location_id::text = cr3_comp_costs.location_id;
