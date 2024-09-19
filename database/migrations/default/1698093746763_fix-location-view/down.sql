-- public.locations_with_crash_injury_counts source

CREATE OR REPLACE VIEW public.locations_with_crash_injury_counts
AS WITH crashes AS (
         WITH cris_crashes AS (
                 SELECT crashes_1.location_id,
                    count(crashes_1.crash_id) AS crash_count,
                    COALESCE(sum(crashes_1.est_comp_cost_crash_based), 0::numeric) AS total_est_comp_cost,
                    COALESCE(sum(crashes_1.death_cnt), 0::bigint) AS fatality_count,
                    COALESCE(sum(crashes_1.sus_serious_injry_cnt), 0::bigint) AS suspected_serious_injury_count
                   FROM atd_txdot_crashes crashes_1
                  WHERE true AND crashes_1.location_id IS NOT NULL AND crashes_1.crash_date > (now() - '5 years'::interval)
                  GROUP BY crashes_1.location_id
                ), apd_crashes AS (
                 SELECT crashes_1.location_id,
                    count(crashes_1.case_id) AS crash_count,
                    COALESCE(sum(crashes_1.est_comp_cost), 0::numeric) AS total_est_comp_cost,
                    0 AS fatality_count,
                    0 AS suspected_serious_injury_count
                   FROM atd_apd_blueform crashes_1
                  WHERE true AND crashes_1.location_id IS NOT NULL AND crashes_1.date > (now() - '5 years'::interval)
                  GROUP BY crashes_1.location_id
                )
         SELECT cris_crashes.location_id,
            cris_crashes.crash_count + apd_crashes.crash_count AS crash_count,
            cris_crashes.total_est_comp_cost + (10000 * apd_crashes.crash_count)::numeric AS total_est_comp_cost,
            cris_crashes.fatality_count + apd_crashes.fatality_count AS fatalities_count,
            cris_crashes.suspected_serious_injury_count + apd_crashes.suspected_serious_injury_count AS serious_injury_count
           FROM cris_crashes
             FULL JOIN apd_crashes ON cris_crashes.location_id::text = apd_crashes.location_id::text
        )
 SELECT locations.description,
    locations.location_id,
    COALESCE(crashes.crash_count, 0::bigint) AS crash_count,
    COALESCE(crashes.total_est_comp_cost, 0::numeric) AS total_est_comp_cost,
    COALESCE(crashes.fatalities_count, 0::bigint) AS fatalities_count,
    COALESCE(crashes.serious_injury_count, 0::bigint) AS serious_injury_count
   FROM atd_txdot_locations locations
     LEFT JOIN crashes ON locations.location_id::text = crashes.location_id::text
  WHERE true AND locations.council_district > 0 AND locations.location_group = 1;
