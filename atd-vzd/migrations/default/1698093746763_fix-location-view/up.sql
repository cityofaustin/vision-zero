CREATE OR REPLACE VIEW public.locations_with_crash_injury_counts
AS
WITH crashes AS (
         WITH cris_crashes AS (
                 SELECT cr3_crashes.location_id,
                    count(cr3_crashes.crash_id) AS crash_count,
                    COALESCE(sum(cr3_crashes.est_comp_cost_crash_based), 0::numeric) AS total_est_comp_cost,
                    COALESCE(sum(cr3_crashes.death_cnt), 0::bigint) AS fatality_count,
                    COALESCE(sum(cr3_crashes.sus_serious_injry_cnt), 0::bigint) AS suspected_serious_injury_count
                   FROM atd_txdot_crashes cr3_crashes
                  WHERE true AND cr3_crashes.location_id IS NOT NULL AND cr3_crashes.crash_date > (now() - '5 years'::interval)
                  GROUP BY cr3_crashes.location_id
                ), apd_crashes AS (
                 SELECT non_cr3_crashes.location_id,
                    count(non_cr3_crashes.case_id) AS crash_count,
                    COALESCE(sum(non_cr3_crashes.est_comp_cost), 0::numeric) AS total_est_comp_cost,
                    0 AS fatality_count,
                    0 AS suspected_serious_injury_count
                   FROM atd_apd_blueform non_cr3_crashes
                  WHERE true AND non_cr3_crashes.location_id IS NOT NULL AND non_cr3_crashes.date > (now() - '5 years'::interval)
                  GROUP BY non_cr3_crashes.location_id
                )
         SELECT cris_crashes.location_id,
            coalesce(cris_crashes.crash_count, 0) + coalesce(apd_crashes.crash_count, 0) AS crash_count,
            coalesce(cris_crashes.total_est_comp_cost, 0) + (10000 * coalesce(apd_crashes.crash_count, 0))::numeric AS total_est_comp_cost,
            coalesce(cris_crashes.fatality_count, 0) + coalesce(apd_crashes.fatality_count, 0) AS fatalities_count,
            coalesce(cris_crashes.suspected_serious_injury_count, 0) + coalesce(apd_crashes.suspected_serious_injury_count, 0) AS serious_injury_count
           FROM cris_crashes
             FULL JOIN apd_crashes ON cris_crashes.location_id::text = apd_crashes.location_id::text
        )
 SELECT locations.description,
    locations.location_id,
    COALESCE(crashes.crash_count, 0) AS crash_count,
    COALESCE(crashes.total_est_comp_cost, 0::numeric) AS total_est_comp_cost,
    COALESCE(crashes.fatalities_count, 0) AS fatalities_count,
    COALESCE(crashes.serious_injury_count, 0) AS serious_injury_count
   FROM atd_txdot_locations locations
     LEFT JOIN crashes ON locations.location_id::text = crashes.location_id::text
  WHERE true 
  AND locations.council_district > 0 AND locations.location_group = 1;
