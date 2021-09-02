-- Demographics by Age, Sex and Ethnicity
CREATE OR REPLACE VIEW view_vzv_demographics_age_sex_eth AS
    SELECT
           -- Year and type
           data.year,
           data.type,
           -- Age Group
           SUM(data.under_18) AS under_18,
           SUM(data.from_18_to_44) AS from_18_to_44,
           SUM(data.from_45_to_64) AS from_45_to_64,
           SUM(data.from_65) AS from_65,
           SUM(data.unknown) AS unknown,
           -- Gender
           SUM(data.gender_male) AS gender_male,
           SUM(data.gender_female) AS gender_female,
           SUM(data.gender_unknown) AS gender_unknown,
           -- Ethnicity
           SUM(data.ethn_unknown) AS eth_unknown,
           SUM(data.ethn_white) AS ethn_white,
           SUM(data.ethn_hispanic) AS ethn_hispanic,
           SUM(data.ethn_black) AS ethn_black,
           SUM(data.ethn_asian) AS ethn_asian,
           SUM(data.ethn_other) AS ethn_other,
           SUM(data.ethn_amer_ind_nat) AS ethn_amer_ind_nat,
           -- Total
           SUM(data.total) AS total
    FROM
    (
        -- Death Counts by Year: Person
        SELECT
            -- Year and type
            date_part('year', atc.crash_date) AS year,
            'fatalities' AS type,
            -- Age group
            SUM(CASE WHEN atp.prsn_age < 18 THEN 1 ELSE 0 END) AS under_18,
            SUM(CASE WHEN atp.prsn_age > 17 AND atp.prsn_age < 45 THEN 1 ELSE 0 END) AS from_18_to_44,
            SUM(CASE WHEN atp.prsn_age > 44 AND atp.prsn_age < 65 THEN 1 ELSE 0 END) AS from_45_to_64,
            SUM(CASE WHEN atp.prsn_age > 64 THEN 1 ELSE 0 END) AS from_65,
            SUM(CASE WHEN atp.prsn_age IS NULL THEN 1 ELSE 0 END) AS unknown,
            -- Gender
            SUM(CASE WHEN atp.prsn_gndr_id = 1 THEN 1 ELSE 0 END) AS gender_male,
            SUM(CASE WHEN atp.prsn_gndr_id = 2 THEN 1 ELSE 0 END) AS gender_female,
            SUM(CASE WHEN atp.prsn_gndr_id = 0 OR atp.prsn_gndr_id IS NULL THEN 1 ELSE 0 END) AS gender_unknown,
            -- Ethnicity
            SUM(CASE WHEN atp.prsn_ethnicity_id = 0 THEN 1 ELSE 0 END) AS ethn_unknown,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 1 THEN 1 ELSE 0 END) AS ethn_white,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 2 THEN 1 ELSE 0 END) AS ethn_black,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 3 THEN 1 ELSE 0 END) AS ethn_hispanic,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 4 THEN 1 ELSE 0 END) AS ethn_asian,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 5 THEN 1 ELSE 0 END) AS ethn_other,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 6 THEN 1 ELSE 0 END) AS ethn_amer_ind_nat,
            -- Total
            SUM(1) AS total
        FROM atd_txdot_crashes AS atc
            LEFT JOIN atd_txdot_person AS atp ON atc.crash_id = atp.crash_id
        WHERE 1=1
            AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
            AND (atp.death_cnt > 0)
            AND (
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
        GROUP BY year

    UNION

    -- Death Counts by Year: Primary Persons
    SELECT
            -- Year and type
            date_part('year', atc.crash_date) AS year,
            'fatalities' AS type,
            -- Age group
            SUM(CASE WHEN atp.prsn_age < 18 THEN 1 ELSE 0 END) AS under_18,
            SUM(CASE WHEN atp.prsn_age > 17 AND atp.prsn_age < 45 THEN 1 ELSE 0 END) AS from_18_to_44,
            SUM(CASE WHEN atp.prsn_age > 44 AND atp.prsn_age < 65 THEN 1 ELSE 0 END) AS from_45_to_64,
            SUM(CASE WHEN atp.prsn_age > 64 THEN 1 ELSE 0 END) AS from_65,
            SUM(CASE WHEN atp.prsn_age IS NULL THEN 1 ELSE 0 END) AS unknown,
            -- Gender
            SUM(CASE WHEN atp.prsn_gndr_id = 1 THEN 1 ELSE 0 END) AS gender_male,
            SUM(CASE WHEN atp.prsn_gndr_id = 2 THEN 1 ELSE 0 END) AS gender_female,
            SUM(CASE WHEN atp.prsn_gndr_id = 0 OR atp.prsn_gndr_id IS NULL THEN 1 ELSE 0 END) AS gender_unknown,
            -- Ethnicity
            SUM(CASE WHEN atp.prsn_ethnicity_id = 0 THEN 1 ELSE 0 END) AS ethn_unknown,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 1 THEN 1 ELSE 0 END) AS ethn_white,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 2 THEN 1 ELSE 0 END) AS ethn_black,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 3 THEN 1 ELSE 0 END) AS ethn_hispanic,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 4 THEN 1 ELSE 0 END) AS ethn_asian,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 5 THEN 1 ELSE 0 END) AS ethn_other,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 6 THEN 1 ELSE 0 END) AS ethn_amer_ind_nat,
            -- Total
            SUM(1) AS total
        FROM atd_txdot_crashes AS atc
            LEFT JOIN atd_txdot_primaryperson AS atp ON atc.crash_id = atp.crash_id
        WHERE 1=1
            AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
            AND (atp.death_cnt > 0)
            AND (
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
        GROUP BY year

    UNION

    -- SI Counts by Year: Person
    SELECT
            -- Year and type
            date_part('year', atc.crash_date) AS year,
            'serious_injuries' AS type,
            -- Age group
            SUM(CASE WHEN atp.prsn_age < 18 THEN 1 ELSE 0 END) AS under_18,
            SUM(CASE WHEN atp.prsn_age > 17 AND atp.prsn_age < 45 THEN 1 ELSE 0 END) AS from_18_to_44,
            SUM(CASE WHEN atp.prsn_age > 44 AND atp.prsn_age < 65 THEN 1 ELSE 0 END) AS from_45_to_64,
            SUM(CASE WHEN atp.prsn_age > 64 THEN 1 ELSE 0 END) AS from_65,
            SUM(CASE WHEN atp.prsn_age IS NULL THEN 1 ELSE 0 END) AS unknown,
            -- Gender
            SUM(CASE WHEN atp.prsn_gndr_id = 1 THEN 1 ELSE 0 END) AS gender_male,
            SUM(CASE WHEN atp.prsn_gndr_id = 2 THEN 1 ELSE 0 END) AS gender_female,
            SUM(CASE WHEN atp.prsn_gndr_id = 0 OR atp.prsn_gndr_id IS NULL THEN 1 ELSE 0 END) AS gender_unknown,
            -- Ethnicity
            SUM(CASE WHEN atp.prsn_ethnicity_id = 0 THEN 1 ELSE 0 END) AS ethn_unknown,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 1 THEN 1 ELSE 0 END) AS ethn_white,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 2 THEN 1 ELSE 0 END) AS ethn_black,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 3 THEN 1 ELSE 0 END) AS ethn_hispanic,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 4 THEN 1 ELSE 0 END) AS ethn_asian,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 5 THEN 1 ELSE 0 END) AS ethn_other,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 6 THEN 1 ELSE 0 END) AS ethn_amer_ind_nat,
            -- Total
            SUM(1) AS total
        FROM atd_txdot_crashes AS atc
            LEFT JOIN atd_txdot_person AS atp ON atc.crash_id = atp.crash_id
        WHERE 1=1
            AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
            AND (atp.sus_serious_injry_cnt > 0)
            AND (
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
        GROUP BY year

    UNION

    -- SI Counts by Year: Person
    SELECT
            -- Year and type
            date_part('year', atc.crash_date) AS year,
            'serious_injuries' AS type,
            -- Age group
            SUM(CASE WHEN atp.prsn_age < 18 THEN 1 ELSE 0 END) AS under_18,
            SUM(CASE WHEN atp.prsn_age > 17 AND atp.prsn_age < 45 THEN 1 ELSE 0 END) AS from_18_to_44,
            SUM(CASE WHEN atp.prsn_age > 44 AND atp.prsn_age < 65 THEN 1 ELSE 0 END) AS from_45_to_64,
            SUM(CASE WHEN atp.prsn_age > 64 THEN 1 ELSE 0 END) AS from_65,
            SUM(CASE WHEN atp.prsn_age IS NULL THEN 1 ELSE 0 END) AS unknown,
            -- Gender
            SUM(CASE WHEN atp.prsn_gndr_id = 1 THEN 1 ELSE 0 END) AS gender_male,
            SUM(CASE WHEN atp.prsn_gndr_id = 2 THEN 1 ELSE 0 END) AS gender_female,
            SUM(CASE WHEN atp.prsn_gndr_id = 0 OR atp.prsn_gndr_id IS NULL THEN 1 ELSE 0 END) AS gender_unknown,
            -- Ethnicity
            SUM(CASE WHEN atp.prsn_ethnicity_id = 0 THEN 1 ELSE 0 END) AS ethn_unknown,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 1 THEN 1 ELSE 0 END) AS ethn_white,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 2 THEN 1 ELSE 0 END) AS ethn_black,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 3 THEN 1 ELSE 0 END) AS ethn_hispanic,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 4 THEN 1 ELSE 0 END) AS ethn_asian,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 5 THEN 1 ELSE 0 END) AS ethn_other,
            SUM(CASE WHEN atp.prsn_ethnicity_id = 6 THEN 1 ELSE 0 END) AS ethn_amer_ind_nat,
            -- Total
            SUM(1) AS total
        FROM atd_txdot_crashes AS atc
            LEFT JOIN atd_txdot_primaryperson AS atp ON atc.crash_id = atp.crash_id
        WHERE 1=1
            AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
            AND (atp.sus_serious_injry_cnt > 0)
            AND (
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
        GROUP BY year

    ) AS data
        GROUP BY data.year, data.type
        ORDER BY data.year, data.type
    ;




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
