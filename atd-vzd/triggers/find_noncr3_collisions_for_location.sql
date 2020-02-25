CREATE OR REPLACE FUNCTION public.find_noncr3_collisions_for_location
(id integer)
 RETURNS SETOF atd_apd_blueform
 LANGUAGE sql
 STABLE
AS $function$
SELECT
  *
FROM
  atd_apd_blueform AS blueform
WHERE
	ST_Contains((
		SELECT
  atd_loc.shape
FROM atd_txdot_locations AS atd_loc
WHERE
			atd_loc.unique_id::INTEGER=id), ST_MakePoint (blueform.longitude, blueform.latitude))
$function$
