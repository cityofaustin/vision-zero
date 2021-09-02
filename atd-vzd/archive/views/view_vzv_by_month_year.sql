-- By Month/Year
CREATE OR REPLACE VIEW view_vzv_by_month_year AS
    SELECT
        date_part('year', atc.crash_date) AS year,
        date_part('month', atc.crash_date) AS month,
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
    GROUP BY year, month;
