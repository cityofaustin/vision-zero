-- CR3 Collisions
CREATE OR REPLACE FUNCTION public.find_location_for_cr3_collision(
    id integer)
    RETURNS SETOF atd_txdot_locations
    LANGUAGE 'sql'

    COST 100
    STABLE
    ROWS 1000
AS $BODY$SELECT atl.* FROM atd_txdot_crashes AS atc
                               INNER JOIN atd_txdot_locations AS atl
                                          ON ( 1=1
                                              AND atl.location_group = 1
                                              AND (atl.shape && st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
                                              AND ST_Contains(atl.shape, st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
                                              )
         WHERE 1=1
           AND atc.crash_id = id
$BODY$;


--- Non CR3 Collisions

CREATE OR REPLACE FUNCTION public.find_location_for_noncr3_collision(
    id integer)
    RETURNS SETOF atd_txdot_locations
    LANGUAGE 'sql'

    COST 100
    STABLE
    ROWS 1000
AS $BODY$SELECT atl.* FROM atd_apd_blueform AS aab
                               INNER JOIN atd_txdot_locations AS atl
                                          ON ( 1=1
                                              AND atl.location_group = 1
                                              AND (atl.shape && st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
                                              AND ST_Contains(atl.shape, st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
                                              )
         WHERE 1=1
           AND aab.case_id = id
$BODY$;


-- Find Location id for CR3 collision

CREATE OR REPLACE FUNCTION public.find_location_id_for_cr3_collision(
    id integer)
    RETURNS character varying
    LANGUAGE 'sql'

    COST 100
    STABLE
AS $BODY$    SELECT atl.location_id FROM atd_txdot_crashes AS atc
                                             INNER JOIN atd_txdot_locations AS atl
                                                        ON ( 1=1
                                                            AND atl.location_group = 1
                                                            AND (atl.shape && st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
                                                            AND ST_Contains(atl.shape, st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
                                                            )
             WHERE atc.crash_id = id LIMIT 1
$BODY$;
