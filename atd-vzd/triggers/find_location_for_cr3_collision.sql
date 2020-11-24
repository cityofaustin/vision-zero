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


alter function find_location_for_cr3_collision(integer) owner to atd_vz_data;
