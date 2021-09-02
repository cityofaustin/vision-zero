CREATE OR REPLACE FUNCTION find_cr3_mainlane_crash(cr3_crash_id integer) returns SETOF atd_txdot_crashes
    STABLE
    LANGUAGE sql
AS
$$
    SELECT atc.*
    FROM atd_txdot_crashes AS atc
            INNER JOIN cr3_mainlanes AS cr3m ON (
            atc.position && cr3m.geometry
            AND ST_Contains(
                    ST_Transform(
                            ST_Buffer(
                                    ST_Transform(cr3m.geometry, 2277),
                                    1,
                                    'endcap=flat join=round'
                                ), 4326
                        ),
                    atc.position
                )
        )
    WHERE atc.crash_id = cr3_crash_id
$$;

ALTER FUNCTION find_cr3_mainlane_crash(integer) OWNER TO atd_vz_data;