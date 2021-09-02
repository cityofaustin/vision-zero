-- VZV HEADER NUMBERS
CREATE OR REPLACE VIEW view_vzv_header_totals AS
SELECT
           people.*,
           crashes.total_crashes
    FROM (
        SELECT
               people.year,
               SUM(people.death_cnt) AS death_cnt,
               SUM(people.yll) AS years_of_life_lost,
               SUM(people.sus_serious_injry_cnt) AS sus_serious_injry_cnt
        FROM (
            SELECT
                   date_part('year', atc.crash_date) AS year,
                   SUM(
                       CASE WHEN (atpp.death_cnt > 0) THEN (
                           CASE WHEN atpp.prsn_age >= 75 THEN 0 ELSE (75 - atpp.prsn_age) END
                       ) ELSE 0 END
                   ) AS yll,
                   SUM(atpp.death_cnt) AS death_cnt,
                   SUM(atpp.sus_serious_injry_cnt) AS sus_serious_injry_cnt
            FROM atd_txdot_crashes AS atc
                 LEFT JOIN atd_txdot_primaryperson AS atpp ON atpp.crash_id = atc.crash_id
            WHERE 1 = 1
              AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
              AND (atpp.death_cnt > 0 or atpp.sus_serious_injry_cnt > 0)
              AND (
                  -- Last Year
                    (
                        atc.crash_date >= (CONCAT(
                                           date_part('year', (NOW() - interval '1 year'))::text, '-01-01'
                                       )::date)
                        AND atc.crash_date < (CONCAT(
                                           date_part('year', (NOW() - interval '1 year'))::text, '-',
                                           LPAD(date_part('month', (NOW() - interval '1 months'))::text, 2, '0'), '-01'
                                       )::date)
                    )
                  -- Year to date
                  OR (
                      atc.crash_date >= (CONCAT(
                                   date_part('year', NOW())::text, '-01-01'
                               )::date)
                      AND atc.crash_date < (CONCAT(
                                   date_part('year', NOW())::text, '-',
                                   LPAD(date_part('month', (NOW() - interval '1 months'))::text, 2, '0'), '-01'
                               )::date)
                  )
                )
            GROUP BY year

            UNION

            SELECT
                   date_part('year', atc.crash_date) AS year,
                   SUM(
                       CASE WHEN (atpp.death_cnt > 0) THEN (
                           CASE WHEN atpp.prsn_age >= 75 THEN 0 ELSE (75 - atpp.prsn_age) END
                       ) ELSE 0 END
                   ) AS yll,
                   SUM(atpp.death_cnt) AS death_cnt,
                   SUM(atpp.sus_serious_injry_cnt) AS sus_serious_injry_cnt
            FROM atd_txdot_crashes AS atc
                 LEFT JOIN atd_txdot_person AS atpp ON atpp.crash_id = atc.crash_id
            WHERE 1 = 1
              AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
              AND (atpp.death_cnt > 0 or atpp.sus_serious_injry_cnt > 0)
              AND (
                  -- Last Year
                    (
                        atc.crash_date >= (CONCAT(
                                           date_part('year', (NOW() - interval '1 year'))::text, '-01-01'
                                       )::date)
                        AND atc.crash_date < (CONCAT(
                                           date_part('year', (NOW() - interval '1 year'))::text, '-',
                                           LPAD(date_part('month', (NOW() - interval '1 months'))::text, 2, '0'), '-01'
                                       )::date)
                    )
                  -- Year to date
                  OR (
                      atc.crash_date >= (CONCAT(
                                   date_part('year', NOW())::text, '-01-01'
                               )::date)
                      AND atc.crash_date < (CONCAT(
                                   date_part('year', NOW())::text, '-',
                                   LPAD(date_part('month', (NOW() - interval '1 months'))::text, 2, '0'), '-01'
                               )::date)
                  )
                )
            GROUP BY year
        ) AS people
        GROUP BY people.year
    ) AS people
    LEFT JOIN (
        SELECT
            date_part('year', atc.crash_date) AS year,
            COUNT(1) AS total_crashes
        FROM atd_txdot_crashes AS atc
        WHERE 1 = 1
            AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
            AND (
                  -- Last Year
                    (
                        atc.crash_date >= (CONCAT(
                                           date_part('year', (NOW() - interval '1 year'))::text, '-01-01'
                                       )::date)
                        AND atc.crash_date < (CONCAT(
                                           date_part('year', (NOW() - interval '1 year'))::text, '-',
                                           LPAD(date_part('month', (NOW() - interval '1 months'))::text, 2, '0'), '-01'
                                       )::date)
                    )
                  -- Year to date
                  OR (
                      atc.crash_date >= (CONCAT(
                                   date_part('year', NOW())::text, '-01-01'
                               )::date)
                      AND atc.crash_date < (CONCAT(
                                   date_part('year', NOW())::text, '-',
                                   LPAD(date_part('month', (NOW() - interval '1 months'))::text, 2, '0'), '-01'
                               )::date)
                  )
                )
        GROUP BY year
    ) AS crashes ON crashes.year = people.year;
