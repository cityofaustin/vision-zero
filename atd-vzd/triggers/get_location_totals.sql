CREATE OR REPLACE FUNCTION public.get_location_totals(
  cr3_crash_date date,
  noncr3_crash_date date,
  cr3_location character varying,
  noncr3_location character varying,
  cost_per_crash numeric
) RETURNS SETOF atd_location_crash_and_cost_totals LANGUAGE sql STABLE AS $ function $
SELECT
  noncr3.location_id,
  cr3.total_crashes + noncr3.total_crashes as total_crashes,
  cr3.est_comp_cost + noncr3.est_comp_cost as total_est_comp_cost,
  cr3.total_crashes as cr3_total_crashes,
  cr3.est_comp_cost as cr3_est_comp_cost,
  noncr3.total_crashes as noncr3_total_crashes,
  noncr3.est_comp_cost as noncr3_est_comp_cost
FROM
  (
    SELECT
      atdcl.location_id,
      count(1) as total_crashes,
      sum(atdc.est_comp_cost) AS est_comp_cost
    FROM
      atd_txdot_locations as atdl
      LEFT JOIN atd_txdot_crash_locations as atdcl ON (atdcl.location_id = atdl.location_id)
      LEFT JOIN atd_txdot_crashes as atdc ON (atdcl.crash_id = atdc.crash_id)
    WHERE
      atdc.crash_date >= cr3_crash_date
      AND atdc.city_id = 22
      AND atdl.location_id IS NOT NULL
      AND atdl.location_id :: text <> 'None' :: text
      AND atdl.location_id = cr3_location
    GROUP BY
      atdcl.location_id
  ) cr3
  JOIN (
    SELECT
      atdl.location_id,
      count(1) as total_crashes,
      (count(1) * cost_per_crash :: numeric) as est_comp_cost
    FROM
      atd_txdot_locations as atdl
      LEFT JOIN atd_apd_blueform as atdbf ON (atdl.location_id = atdbf.location_id)
    WHERE
      atdbf.date >= noncr3_crash_date
      AND atdl.location_id IS NOT NULL
      AND atdl.location_id :: text <> 'None' :: text
      AND atdl.location_id = noncr3_location
    GROUP BY
      atdl.location_id
  ) noncr3 on cr3.location_id = noncr3.location_id $ function $