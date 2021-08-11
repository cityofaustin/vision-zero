create or replace function find_service_road_location_for_centerline_crash(input_crash_id integer)
returns setof atd_txdot_locations
language 'sql'
stable
as $QUERY$
with crash as (
  -- this query will return a crash_id and seek direction iff the crash supplied lies within a mainlane strip
  WITH cr3_mainlanes AS (
    SELECT st_transform(st_buffer(st_transform(st_union(cr3_mainlanes.geometry), 2277), 1), 4326) AS geometry
      FROM cr3_mainlanes
      )
  select c.crash_id, position,
    CASE
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'w' OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'w' THEN 0
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'n' OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'n' THEN 90
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'e' OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'e' THEN 180
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 's' OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 's' THEN 270
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
AND l.description ~~* '%SVRD%'::text
ORDER BY (st_distance(st_centroid(l.shape), c.position))
limit 1
$QUERY$;
