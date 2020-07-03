CREATE OR REPLACE FUNCTION find_location_for_noncr3_collision (id int)
 RETURNS SETOF atd_txdot_locations
 LANGUAGE sql
 STABLE
AS $function$
SELECT atl.location_id, atl.shape FROM atd_apd_blueform AS aab
  INNER JOIN atd_txdot_locations AS atl
    ON ( 1=1
        AND (atl.shape && st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
        AND ST_Contains(atl.shape, st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
    )
WHERE 1=1
  AND aab.call_num = record_call_num
$function$
