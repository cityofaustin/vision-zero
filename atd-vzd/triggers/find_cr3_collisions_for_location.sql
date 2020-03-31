CREATE OR REPLACE FUNCTION public.find_cr3_collisions_for_location
(id varchar)
 RETURNS SETOF atd_txdot_crashes
 LANGUAGE sql
 STABLE
AS $function$
SELECT
  *
FROM
  atd_txdot_crashes AS cr3_crash
WHERE
	ST_Contains((
		SELECT
  atd_loc.shape
FROM atd_txdot_locations AS atd_loc
WHERE
			atd_loc.location_id::VARCHAR=id), ST_SetSRID(ST_MakePoint(cr3_crash.longitude_primary, cr3_crash.latitude_primary), 4326))
$function$
