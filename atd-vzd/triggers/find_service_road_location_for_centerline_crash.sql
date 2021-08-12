-- This function is intended to be called via Hasura when the AWS lambda function, crash_update_location/app.py, 
-- when a crash is found to be on a main-lane. It will return the location_id of a VZ location which belongs
-- to the closest location that was formed from a service road and has its centroid lie within a cone
-- eminating from the crash location in a direction 90 degrees out of phase of the direction of travel
-- notated in the 'rpt_street_name' field or the 'rpt_sec_street_name' field of the crash.
create or replace function find_service_road_location_for_centerline_crash(input_crash_id integer)
returns setof atd_txdot_locations
language 'sql'
stable
as $QUERY$
-- this CTE will setup a in-memory table containing one crash_id, its position, 
-- and the seek direction if and only if the crash supplied lies within a mainlane strip
with crash as (
  WITH cr3_mainlanes AS (
    SELECT st_transform(st_buffer(st_transform(st_union(cr3_mainlanes.geometry), 2277), 1), 4326) AS geometry
      FROM cr3_mainlanes
      )
  select c.crash_id, position,
    CASE
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'w' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'w' THEN 0
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'n' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'n' THEN 90
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'e' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'e' THEN 180
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 's' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 's' THEN 270
      ELSE NULL
    END AS seek_direction
  from atd_txdot_crashes c
  join atd_jurisdictions aj on (aj.id = 5)
  join cr3_mainlanes on (ST_Contains(cr3_mainlanes.geometry, c.position))
  where 1 = 1
  and st_contains(aj.geometry, c.position) and c.private_dr_fl = 'N'
  and c.rpt_road_part_id = ANY (ARRAY[2, 3, 4, 5, 7])
  and c.crash_id = input_crash_id
  limit 1
)
-- this query joins the crash found in the CTE with the polygon layer to find the closest 
-- polygon centroid in the cone eminating from the crash location in the seek_direction defined in the CTE
select l.*
from atd_txdot_locations l
join crash c on (1 = 1)
where
CASE
  WHEN
  CASE
    WHEN (c.seek_direction - 65) < 0 THEN c.seek_direction - 65 + 360
    ELSE c.seek_direction - 65
  END < ((c.seek_direction + 65) % 360) THEN (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) >=
    CASE
      WHEN (c.seek_direction - 65) < 0 THEN c.seek_direction - 65 + 360
      ELSE c.seek_direction - 65
    END 
    AND (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) <= ((c.seek_direction + 65) % 360)
ELSE (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) >=
    CASE
      WHEN (c.seek_direction - 65) < 0 THEN c.seek_direction - 65 + 360
      ELSE c.seek_direction - 65
    END 
    OR (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) <= ((c.seek_direction + 65) % 360)
end
AND st_intersects(st_transform(st_buffer(st_transform(c.position, 2277), 750), 4326), l.shape) 
AND l.description ~~* '%SVRD%'
ORDER BY (st_distance(st_centroid(l.shape), c.position))
limit 1
$QUERY$;
