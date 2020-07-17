create or replace function find_location_for_noncr3_collision(id integer) returns SETOF atd_txdot_locations
    stable
    language sql
as
$$
SELECT atl.* FROM atd_apd_blueform AS aab
                      INNER JOIN atd_txdot_locations AS atl
                                 ON ( 1=1
                                     AND (atl.shape && st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
                                     AND ST_Contains(atl.shape, st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
                                     )
WHERE 1=1
  AND aab.case_id = id
$$;

alter function find_location_for_noncr3_collision(integer) owner to atd_vz_data;

