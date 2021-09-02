-----------------------------------------
-- Add columns from Frank's Polygon table to Locations table

ALTER TABLE "public"."atd_txdot_locations" 
ADD COLUMN "road" int4,
ADD COLUMN "intersection" int4,
ADD COLUMN "spine" geometry,
ADD COLUMN "overlapping_geometry" geometry,
ADD COLUMN "intersection_union" int4 DEFAULT 0,
ADD COLUMN "broken_out_intersections_union" int4 DEFAULT 0,
ADD COLUMN "road_name" varchar
(512),
ADD COLUMN "level_1" int4 DEFAULT 0,
ADD COLUMN "level_2" int4 DEFAULT 0,
ADD COLUMN "level_3" int4 DEFAULT 0,
ADD COLUMN "level_4" int4 DEFAULT 0,
ADD COLUMN "level_5" int4 DEFAULT 0,
ADD COLUMN "street_level" varchar
(16),
ADD COLUMN "is_intersection" int4 NOT NULL DEFAULT 0,
ADD COLUMN "is_svrd" int4 NOT NULL DEFAULT 0,
ADD COLUMN "council_district" int4,
ADD COLUMN "non_cr3_report_count" int4,
ADD COLUMN "cr3_report_count" int4,
ADD COLUMN "total_crash_count" int4,
ADD COLUMN "total_comprehensive_cost" int4,
ADD COLUMN "total_speed_mgmt_points" numeric
(6,2) DEFAULT NULL::numeric,
ADD COLUMN "non_injury_count" int4 NOT NULL DEFAULT 0,
ADD COLUMN "unknown_injury_count" int4 NOT NULL DEFAULT 0,
ADD COLUMN "possible_injury_count" int4 NOT NULL DEFAULT 0,
ADD COLUMN "non_incapacitating_injury_count" int4 NOT NULL DEFAULT 0,
ADD COLUMN "suspected_serious_injury_count" int4 NOT NULL DEFAULT 0,
ADD COLUMN "death_count" int4 NOT NULL DEFAULT 0,
ADD COLUMN "crash_history_score" numeric
(4,2) DEFAULT NULL::numeric,
ADD COLUMN "sidewalk_score" int4,
ADD COLUMN "bicycle_score" int4,
ADD COLUMN "transit_score" int4,
ADD COLUMN "community_dest_score" int4,
ADD COLUMN "minority_score" int4,
ADD COLUMN "poverty_score" int4,
ADD COLUMN "community_context_score" int4,
ADD COLUMN "total_cc_and_history_score" numeric
(4,2) DEFAULT NULL::numeric,
ADD COLUMN "is_intersecting_district" int4 DEFAULT 0,
ADD COLUMN "polygon_id" varchar
(16),
ADD COLUMN "signal_engineer_area_id" int4,
ADD COLUMN "development_engineer_area_id" int4,
ADD COLUMN "polygon_hex_id" varchar
(16);

-----------------------------------------
-- DELETE all records from Location table

DELETE FROM "public"."atd_txdot_locations";

-----------------------------------------
-- Copy all records from Polygon to Location table

INSERT INTO "public"."atd_txdot_locations"
SELECT
  polygon_hex_id as location_id,
  road_name as description,
  NULL as address,
  NULL as metadata,
  now() as last_update,
  FALSE as is_retired,
  FALSE as is_studylocation,
  0 as priority_level,
  geometry as shape,
  NULL as latitude,
  NULL as longitude,
  NULL as scale_factor,
  geometry as geometry,
  NULL as unique_id,
  NULL as asmp_street_level,
  road as road,
  intersection as intersection,
  spine as spine,
  overlapping_geometry as overlapping_geometry,
  intersection_union as intersection_union,
  broken_out_intersections_union as broken_out_intersections_union,
  road_name as road_name,
  level_1 as level_1,
  level_2 as level_2,
  level_3 as level_3,
  level_4 as level_4,
  level_5 as level_5,
  street_level as street_level,
  is_intersection as is_intersection,
  is_svrd as is_svrd,
  council_district as council_district,
  non_cr3_report_count as non_cr3_report_count,
  cr3_report_count as cr3_report_count,
  total_crash_count as total_crash_count,
  total_comprehensive_cost as total_comprehensive_cost,
  total_speed_mgmt_points as total_speed_mgmt_points,
  non_injury_count as non_injury_count,
  unknown_injury_count as unknown_injury_count,
  possible_injury_count as possible_injury_count,
  non_incapacitating_injury_count as non_incapacitating_injury_count,
  suspected_serious_injury_count as suspected_serious_injury_count,
  death_count as death_count,
  crash_history_score as crash_history_score,
  sidewalk_score as sidewalk_score,
  bicycle_score as bicycle_score,
  transit_score as transit_score,
  community_dest_score as community_dest_score,
  minority_score as minority_score,
  poverty_score as poverty_score,
  community_context_score as community_context_score,
  total_cc_and_history_score as total_cc_and_history_score,
  is_intersecting_district as is_intersecting_district,
  polygon_id as polygon_id,
  signal_engineer_area_id as signal_engineer_area_id,
  development_engineer_area_id as development_engineer_area_id,
  polygon_hex_id as polygon_hex_id
FROM "public"
."polygons";


-----------------------------------------
-- Convert shape column records from 2277 to 4326 Web Mercator projection

UPDATE
	atd_txdot_locations
SET
	shape = ST_Transform(ST_SetSRID(geometry, 2277), 4326)
WHERE
	location_id IS NOT NULL;


-----------------------------------------
--- Add centroid lat lon to all records

UPDATE
	atd_txdot_locations
SET
	longitude = ST_X(ST_CENTROID(shape))
WHERE
	location_id IS NOT NULL;

UPDATE
	atd_txdot_locations
SET
	latitude = ST_Y(ST_CENTROID(shape))
WHERE
	location_id IS NOT NULL;


-----------------------------------------
--- Add location ID to exisiting crash records
ALTER TABLE "public"."atd_txdot_crashes" ADD COLUMN "location_id" varchar;

-- Run create function script from triggers/find_cr3_collision_for_location.sql

