CREATE OR REPLACE FUNCTION public.find_location_for_cr3_collision
(id int4)
 RETURNS SETOF atd_txdot_locations
 LANGUAGE sql
 STABLE
AS $function$
SELECT
	*
FROM
	atd_txdot_locations AS LOCATION
WHERE
	ST_WITHIN((
		SELECT
			crash.position FROM atd_txdot_crashes AS crash
		WHERE
			crash.crash_id = id), location.shape)
$function$
