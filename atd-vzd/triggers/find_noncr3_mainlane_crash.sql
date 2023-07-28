CREATE OR REPLACE FUNCTION find_noncr3_mainlane_crash(ncr3_case_id integer) returns SETOF atd_apd_blueform
    STABLE
    LANGUAGE sql
AS
$$
    SELECT atc.*
    FROM atd_apd_blueform AS atc
            INNER JOIN non_cr3_mainlanes AS ncr3m ON (
            atc.position && ncr3m.geometry
            AND ST_Contains(
                    ST_Transform(
                            ST_Buffer(
                                    ST_Transform(ncr3m.geometry, 2277),
                                    1,
                                    'endcap=flat join=round'
                                ), 4326
                        ),
                    atc.position
                )
        )
    WHERE atc.crash_id = ncr3_case_id
$$;

ALTER FUNCTION find_noncr3_mainlane_crash(integer) OWNER TO atd_vz_data;
