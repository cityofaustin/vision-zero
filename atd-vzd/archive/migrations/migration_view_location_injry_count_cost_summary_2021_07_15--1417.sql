-- update view to use the crash based comprehensive cost values
-- This view is also found in atd-vzd/views/view_location_injry_count_cost_summary-schema.sql
CREATE or replace VIEW public.view_location_injry_count_cost_summary AS
SELECT
  atcloc.location_id::character varying (32) AS location_id,
  COALESCE(ccs.total_crashes, 0) + COALESCE(blueform_ccs.total_crashes, 0) AS total_crashes,
  COALESCE(ccs.total_deaths, 0::bigint) AS total_deaths,
  COALESCE(ccs.total_serious_injuries, 0::bigint) AS total_serious_injuries,
  (COALESCE(ccs.est_comp_cost, 0) + COALESCE(blueform_ccs.est_comp_cost, 0))::numeric AS est_comp_cost
FROM atd_txdot_locations atcloc
  LEFT JOIN (
    SELECT
      atc.location_id,
      count(1) AS total_crashes,
      sum(atc.death_cnt) AS total_deaths,
      sum(atc.sus_serious_injry_cnt) AS total_serious_injuries,
      sum(atc.est_comp_cost_crash_based) AS est_comp_cost
    FROM
      atd_txdot_crashes AS atc
  WHERE (1 = 1
    AND atc.crash_date > now() - '5 years'::interval
    AND(atc.location_id IS NOT NULL)
    AND((atc.location_id)::text <> 'None'::text))
  GROUP BY
    atc.location_id) ccs ON ccs.location_id::text = atcloc.location_id::text
  LEFT JOIN(
    SELECT
      aab.location_id,
      sum(aab.est_comp_cost_crash_based) AS est_comp_cost,
      count(1) AS total_crashes
    FROM
      atd_apd_blueform AS aab
    WHERE (1 = 1
      AND aab.date > now() - '5 years'::interval
      AND(aab.location_id IS NOT NULL)
      AND(aab.location_id::text <> 'None'::text))
    GROUP BY
      aab.location_id) blueform_ccs ON (blueform_ccs.location_id = atcloc.location_id)

-- set ownership if needed
ALTER TABLE public.view_location_injry_count_cost_summary OWNER TO atd_vz_data;

