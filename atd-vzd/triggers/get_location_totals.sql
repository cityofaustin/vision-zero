CREATE
OR REPLACE FUNCTION public.get_location_totals(
  cr3_crash_date date,
  noncr3_crash_date date,
  cr3_location character varying,
  noncr3_location character varying,
  cost_per_crash numeric
) RETURNS SETOF atd_location_crash_and_cost_totals AS $$
SELECT
  cr3.location_id,
  (cr3.total_crashes + noncr3.total_crashes) AS total_crashes,
  (cr3.est_comp_cost + noncr3.est_comp_cost) AS total_est_comp_cost,
  cr3.total_crashes AS cr3_total_crashes,
  cr3.est_comp_cost AS cr3_est_comp_cost,
  noncr3.total_crashes AS noncr3_total_crashes,
  noncr3.est_comp_cost AS noncr3_est_comp_cost
FROM
  (
    SELECT
      atdl.location_id AS location_id,
      count(atdc) AS total_crashes,
      coalesce(sum(atdc.est_comp_cost), 0) AS est_comp_cost
    FROM
      atd_txdot_locations AS atdl
      LEFT JOIN atd_txdot_crashes AS atdc ON (
        atdl.location_id = atdc.location_id
        AND atdc.city_id = 22
        AND atdc.crash_date >= cr3_crash_date :: date
      )
    WHERE
      atdl.location_id = cr3_location :: text
      AND atdl.location_id IS NOT NULL
      AND atdl.location_id :: text <> 'None' :: text
    GROUP BY
      atdl.location_id
  ) cr3
  JOIN (
    SELECT
      atdl.location_id AS location_id,
      count(atdbf) AS total_crashes,
      coalesce((count(atdbf) * cost_per_crash), 0) AS est_comp_cost
    FROM
      atd_txdot_locations AS atdl
      LEFT JOIN atd_apd_blueform AS atdbf ON (
        atdl.location_id = atdbf.location_id
        AND atdbf.date >= noncr3_crash_date :: date
      )
    WHERE
      atdl.location_id IS NOT NULL
      AND atdl.location_id :: text <> 'None' :: text
      AND atdl.location_id = noncr3_location :: text
    GROUP BY
      atdl.location_id
  ) noncr3 on cr3.location_id = noncr3.location_id
  $$ LANGUAGE sql STABLE;
