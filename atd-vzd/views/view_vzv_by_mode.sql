-- Crashes By Mode
CREATE OR REPLACE VIEW view_vzv_by_mode AS
    SELECT
        date_part('year', atc.crash_date) AS year,
        (
               CASE
                   -- MOTOR VEHICLE
                   WHEN vdesc.veh_unit_desc_id = 1 THEN (
                       CASE
                       -- MOTORCYCLE
                       WHEN vbody.veh_body_styl_id = 71 THEN 'Motorcyclist'
                       ELSE 'Motorist' END
                   )
                   -- PEDALCYCLIST / BYCICLE
                   WHEN vdesc.veh_unit_desc_id = 3 THEN 'Bicyclist'
                   -- PEDESTRIAN
                   WHEN vdesc.veh_unit_desc_id = 4 THEN 'Pedestrian'
                   -- OTHER
                   ELSE 'Other'
               END
        ) AS unit_desc,
        SUM(atu.death_cnt) AS death_cnt,
        SUM(atu.sus_serious_injry_cnt) AS sus_serious_injry_cnt
    FROM atd_txdot_crashes AS atc
        LEFT JOIN atd_txdot_units atu on atc.crash_id = atu.crash_id
        LEFT JOIN atd_txdot__veh_unit_desc_lkp AS vdesc ON vdesc.veh_unit_desc_id = atu.unit_desc_id
        LEFT JOIN atd_txdot__veh_body_styl_lkp AS vbody ON vbody.veh_body_styl_id = atu.veh_body_styl_id
    WHERE 1=1
      AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
      AND (atc.death_cnt > 0 OR atc.sus_serious_injry_cnt > 0)
      AND (
        (
            atc.crash_date >= CONCAT(
                date_part('year', (NOW() - interval '4 year'))::text, '-01-01'
            )::date
        )
        AND (
            atc.crash_date < CONCAT(
                date_part('year', NOW())::text, '-',
                LPAD(date_part('month', (NOW() - interval '1 months'))::text, 2, '0'), '-01'
            )::date
        )
      )
    GROUP BY year, unit_desc
    ORDER BY year, unit_desc;
