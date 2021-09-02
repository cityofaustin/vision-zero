-- By time of day
CREATE OR REPLACE VIEW view_vzv_by_time_of_day AS
    SELECT
        date_part('year', atc.crash_date) AS year,
        To_Char(atc.crash_date, 'Dy') AS dow,
        date_part('hour', atc.crash_time) AS hour,
        SUM(atc.death_cnt) AS death_cnt,
        SUM(atc.sus_serious_injry_cnt) AS sus_serious_injry_cnt
    FROM atd_txdot_crashes AS atc
    WHERE 1=1
      AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
      AND (atc.death_cnt > 0 OR atc.sus_serious_injry_cnt > 0)
      AND ((
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
    GROUP BY
        year, dow, hour
    ORDER BY year, dow, hour ASC;
