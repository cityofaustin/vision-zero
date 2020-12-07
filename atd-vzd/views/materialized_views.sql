DROP MATERIALIZED VIEW IF EXISTS five_year_highway_polygons_with_crash_data CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_outside_any_polygons CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_outside_surface_polygons CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_non_cr3_crashes_outside_surface_polygons CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_cr3_crashes_outside_surface_polygons CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_off_mainlane_outside_surface_polygons CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_surface_polygons_with_crash_data CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_off_mainlane CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_non_cr3_crashes_off_mainlane CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_cr3_crashes_off_mainlane CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_atd_apd_blueform CASCADE;
DROP MATERIALIZED VIEW IF EXISTS five_year_atd_txdot_crashes CASCADE;
DROP MATERIALIZED VIEW IF EXISTS all_crashes_off_mainlane CASCADE;
DROP MATERIALIZED VIEW IF EXISTS all_non_cr3_crashes_off_mainlane CASCADE;
DROP MATERIALIZED VIEW IF EXISTS all_cr3_crashes_off_mainlane CASCADE;
DROP MATERIALIZED VIEW IF EXISTS all_atd_apd_blueform CASCADE;
DROP MATERIALIZED VIEW IF EXISTS all_atd_txdot_crashes CASCADE;



CREATE MATERIALIZED VIEW IF NOT EXISTS all_atd_txdot_crashes as
SELECT c.*, p.location_id as surface_polygon_hex_id
FROM atd_txdot_crashes c
         LEFT JOIN atd_txdot_locations p ON (
        (p.location_group = 1)
        AND c.position && p.geometry AND ST_Contains(p.geometry, c.position))
WHERE crash_date >= 'now'::date - '5 years'::interval;
CREATE INDEX mv_aatc_geometry_idx ON public.all_atd_txdot_crashes USING gist ("position");
CREATE INDEX mv_aatc_crash_id_idx ON public.all_atd_txdot_crashes USING btree ("crash_id");
CREATE INDEX mv_aatc_deaths_idx ON public.all_atd_txdot_crashes USING btree ("death_cnt");
CREATE INDEX mv_aatc_date_idx ON public.all_atd_txdot_crashes USING btree ("crash_date");


CREATE MATERIALIZED VIEW IF NOT EXISTS all_atd_apd_blueform as
SELECT c.*, p.location_id as surface_polygon_hex_id
FROM atd_apd_blueform c
         LEFT JOIN atd_txdot_locations p ON (
        (p.location_group = 1)
        AND c.position && p.geometry AND ST_Contains(p.geometry, c.position))
WHERE date >= 'now'::date - '5 years'::interval;
CREATE INDEX mv_aaab_geometry_idx ON public.all_atd_apd_blueform USING gist ("position");
CREATE INDEX mv_aaab_case_id_idx ON public.all_atd_apd_blueform USING btree ("case_id");
CREATE INDEX mv_aaab_date_idx ON public.all_atd_apd_blueform USING btree ("date");


CREATE MATERIALIZED VIEW IF NOT EXISTS all_cr3_crashes_off_mainlane as
WITH cr3_mainlanes as
         (SELECT ST_Transform(ST_Buffer(ST_Transform(ST_UNION(geometry), 2277),1),4326) as geometry from cr3_mainlanes)
SELECT c.*
FROM all_atd_txdot_crashes c, cr3_mainlanes l
WHERE NOT ST_Contains(l.geometry, c.position);
CREATE INDEX mv_accom_geometry_idx ON public.all_cr3_crashes_off_mainlane USING gist ("position");
CREATE INDEX mv_accom_crash_id_idx ON public.all_cr3_crashes_off_mainlane USING btree ("crash_id");
CREATE INDEX mv_accom_deaths_idx ON public.all_cr3_crashes_off_mainlane USING btree ("death_cnt");
CREATE INDEX mv_accom_date_idx ON public.all_cr3_crashes_off_mainlane USING btree ("crash_date");


CREATE MATERIALIZED VIEW IF NOT EXISTS all_non_cr3_crashes_off_mainlane as
WITH non_cr3_mainlanes as
         (SELECT ST_Transform(ST_Buffer(ST_Transform(ST_UNION(geometry), 2277),1),4326) as geometry from non_cr3_mainlanes)
SELECT c.*
FROM all_atd_apd_blueform c, non_cr3_mainlanes l
WHERE NOT ST_Contains(l.geometry, c.position);
CREATE INDEX mv_anccom_geometry_idx ON public.all_non_cr3_crashes_off_mainlane USING gist ("position");
CREATE INDEX mv_anccom_case_id_idx ON public.all_non_cr3_crashes_off_mainlane USING btree ("case_id");
CREATE INDEX mv_anccom_date_idx ON public.all_non_cr3_crashes_off_mainlane USING btree ("date");


CREATE MATERIALIZED VIEW IF NOT EXISTS all_crashes_off_mainlane as
SELECT 1 as non_cr3, 0 as cr3, case_id as crash_id, date as date, speed_mgmt_points as speed_mgmt_points, est_comp_cost as est_comp_cost, est_econ_cost, position as geometry,
       0 as sus_serious_injry_cnt, 0 as nonincap_injry_cnt, 0 as poss_injry_cnt, 0 as non_injry_cnt, 0 as unkn_injry_cnt, 0 as tot_injry_cnt, 0 as death_cnt
FROM all_non_cr3_crashes_off_mainlane
UNION
SELECT 0 as non_cr3, 1 as cr3, crash_id as crash_id, crash_date as date, speed_mgmt_points as speed_mgmt_points, est_comp_cost as est_comp_cost, est_econ_cost, position as geometry,
       sus_serious_injry_cnt, nonincap_injry_cnt, poss_injry_cnt, non_injry_cnt, unkn_injry_cnt, tot_injry_cnt, death_cnt
FROM all_cr3_crashes_off_mainlane;
CREATE INDEX mv_acom_geometry_idx ON public.all_crashes_off_mainlane USING gist ("geometry");
CREATE INDEX mv_acom_crash_id_idx ON public.all_crashes_off_mainlane USING btree ("crash_id");
CREATE INDEX mv_acom_deaths_idx ON public.all_crashes_off_mainlane USING btree ("death_cnt");
CREATE INDEX mv_acom_date_idx ON public.all_crashes_off_mainlane USING btree ("date");






CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_atd_txdot_crashes as
SELECT c.*, p.location_id as surface_polygon_hex_id
FROM atd_txdot_crashes c
         LEFT JOIN atd_txdot_locations p ON (
        (p.location_group = 1)
        AND c.position && p.geometry AND ST_Contains(p.geometry, c.position))
WHERE crash_date >= '2015-10-30' and crash_date < '2020-10-30';
CREATE INDEX mv_fyatc_geometry_idx ON public.five_year_atd_txdot_crashes USING gist ("position");
CREATE INDEX mv_fyatc_crash_id_idx ON public.five_year_atd_txdot_crashes USING btree ("crash_id");
CREATE INDEX mv_fyatc_deaths_idx ON public.five_year_atd_txdot_crashes USING btree ("death_cnt");
CREATE INDEX mv_fyatc_date_idx ON public.five_year_atd_txdot_crashes USING btree ("crash_date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_atd_apd_blueform as
SELECT c.*, p.location_id as surface_polygon_hex_id
FROM atd_apd_blueform c
         LEFT JOIN atd_txdot_locations p ON (
        (p.location_group = 1)
        AND c.position && p.geometry AND ST_Contains(p.geometry, c.position))
WHERE date >= '2015-10-30' and date < '2020-10-30';
CREATE INDEX mv_fyaab_geometry_idx ON public.five_year_atd_apd_blueform USING gist ("position");
CREATE INDEX mv_fyaab_case_id_idx ON public.five_year_atd_apd_blueform USING btree ("case_id");
CREATE INDEX mv_fyaab_date_idx ON public.five_year_atd_apd_blueform USING btree ("date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_cr3_crashes_off_mainlane as
WITH cr3_mainlanes as
         (SELECT ST_Transform(ST_Buffer(ST_Transform(ST_UNION(geometry), 2277),1),4326) as geometry from cr3_mainlanes)
SELECT c.*
FROM five_year_atd_txdot_crashes c, cr3_mainlanes l
WHERE NOT ST_Contains(l.geometry, c.position);
CREATE INDEX mv_fyccom_geometry_idx ON public.five_year_cr3_crashes_off_mainlane USING gist ("position");
CREATE INDEX mv_fyccom_crash_id_idx ON public.five_year_cr3_crashes_off_mainlane USING btree ("crash_id");
CREATE INDEX mv_fyccom_deaths_idx ON public.five_year_cr3_crashes_off_mainlane USING btree ("death_cnt");
CREATE INDEX mv_fyccom_date_idx ON public.five_year_cr3_crashes_off_mainlane USING btree ("crash_date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_non_cr3_crashes_off_mainlane as
WITH non_cr3_mainlanes as
         (SELECT ST_Transform(ST_Buffer(ST_Transform(ST_UNION(geometry), 2277),1),4326) as geometry from non_cr3_mainlanes)
SELECT c.*
FROM five_year_atd_apd_blueform c, non_cr3_mainlanes l
WHERE NOT ST_Contains(l.geometry, c.position);
CREATE INDEX mv_fynccom_geometry_idx ON public.five_year_non_cr3_crashes_off_mainlane USING gist ("position");
CREATE INDEX mv_fynccom_case_id_idx ON public.five_year_non_cr3_crashes_off_mainlane USING btree ("case_id");
CREATE INDEX mv_fynccom_date_idx ON public.five_year_non_cr3_crashes_off_mainlane USING btree ("date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_all_crashes_off_mainlane as
SELECT 1 as non_cr3, 0 as cr3, case_id as crash_id, date as date, speed_mgmt_points as speed_mgmt_points, est_comp_cost as est_comp_cost, est_econ_cost, position as geometry,
       0 as sus_serious_injry_cnt, 0 as nonincap_injry_cnt, 0 as poss_injry_cnt, 0 as non_injry_cnt, 0 as unkn_injry_cnt, 0 as tot_injry_cnt, 0 as death_cnt
FROM five_year_non_cr3_crashes_off_mainlane
UNION
SELECT 0 as non_cr3, 1 as cr3, crash_id as crash_id, crash_date as date, speed_mgmt_points as speed_mgmt_points, est_comp_cost as est_comp_cost, est_econ_cost, position as geometry,
       sus_serious_injry_cnt, nonincap_injry_cnt, poss_injry_cnt, non_injry_cnt, unkn_injry_cnt, tot_injry_cnt, death_cnt
FROM five_year_cr3_crashes_off_mainlane;
CREATE INDEX mv_fyacom_geometry_idx ON public.five_year_all_crashes_off_mainlane USING gist ("geometry");
CREATE INDEX mv_fyacom_crash_id_idx ON public.five_year_all_crashes_off_mainlane USING btree ("crash_id");
CREATE INDEX mv_fyacom_deaths_idx ON public.five_year_all_crashes_off_mainlane USING btree ("death_cnt");
CREATE INDEX mv_fyacom_date_idx ON public.five_year_all_crashes_off_mainlane USING btree ("date");



CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_surface_polygons_with_crash_data as
SELECT p.location_id, p.road, p.intersection, p.road_name, p.level_1, p.level_2, p.level_3, p.level_4, p.level_5, p.street_level, p.is_intersection, p.council_district, p.sidewalk_score, p.bicycle_score, p.transit_score, p.community_dest_score, p.minority_score, p.poverty_score,
-- p.sidewalk_score + p.bicycle_score + p.transit_score + p.community_dest_score + p.minority_score + p.poverty_score,
       p.community_context_score,
       SUM(c.sus_serious_injry_cnt) as total_sus_serious_injry_cnt,
       SUM(c.nonincap_injry_cnt) as total_nonincap_injry_cnt,
       SUM(c.poss_injry_cnt) as total_poss_injry_cnt,
       SUM(c.non_injry_cnt) as total_non_injry_cnt,
       SUM(c.unkn_injry_cnt) as total_unkn_injry_cnt,
       SUM(c.tot_injry_cnt) as total_tot_injry_cnt,
       SUM(c.death_cnt) as total_death_cnt,
       SUM(c.est_comp_cost) as sum_comp_cost,
       SUM(c.est_econ_cost) as sum_econ_cost,
       SUM(c.non_cr3) as non_cr3_count,
       SUM(c.cr3) as cr3_count,
       SUM(c.non_cr3) + SUM(c.cr3) as total_crash_count,
       p.geometry
FROM atd_txdot_locations p
         LEFT JOIN five_year_all_crashes_off_mainlane c on (c.geometry && p.geometry AND ST_CONTAINS(p.geometry, c.geometry))
WHERE p.location_group = 1
GROUP BY p.location_id;
CREATE INDEX mv_fyspwcd_geometry_idx ON public.five_year_surface_polygons_with_crash_data USING gist ("geometry");
CREATE INDEX mv_fyspwcd_location_id_idx ON public.five_year_surface_polygons_with_crash_data USING btree ("location_id");
CREATE INDEX mv_fyspwcd_deaths_idx ON public.five_year_surface_polygons_with_crash_data USING btree ("total_death_cnt");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_all_crashes_off_mainlane_outside_surface_polygons as
SELECT c.*
FROM five_year_all_crashes_off_mainlane c
         LEFT JOIN atd_txdot_locations p ON (
        (p.location_group = 1)
        AND p.geometry && c.geometry AND ST_Contains(p.geometry, c.geometry))
WHERE p.polygon_hex_id is NULL;
CREATE INDEX mv_fyacomosp_geometry_idx on public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING gist ("geometry");
CREATE INDEX mv_fyacomosp_crash_id_idx ON public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING btree ("crash_id");
CREATE INDEX mv_fyacomosp_deaths_idx ON public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING btree ("death_cnt");
CREATE INDEX mv_fyacomosp_date_idx ON public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING btree ("date");



CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_cr3_crashes_outside_surface_polygons as
SELECT c.*
FROM five_year_atd_txdot_crashes c
WHERE c.surface_polygon_hex_id IS NULL;
CREATE INDEX mv_fyccosp_geometry_idx on public.five_year_cr3_crashes_outside_surface_polygons USING gist ("position");
CREATE INDEX mv_fyccosp_crash_id_idx ON public.five_year_cr3_crashes_outside_surface_polygons USING btree ("crash_id");
CREATE INDEX mv_fyccosp_deaths_idx ON public.five_year_cr3_crashes_outside_surface_polygons USING btree ("death_cnt");
CREATE INDEX mv_fyccosp_date_idx ON public.five_year_cr3_crashes_outside_surface_polygons USING btree ("crash_date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_non_cr3_crashes_outside_surface_polygons as
SELECT c.*
FROM five_year_atd_apd_blueform c
WHERE c.surface_polygon_hex_id IS NULL;
CREATE INDEX mv_fynccosp_geometry_idx on public.five_year_non_cr3_crashes_outside_surface_polygons USING gist ("position");
CREATE INDEX mv_fynccosp_case_id_idx ON public.five_year_non_cr3_crashes_outside_surface_polygons USING btree ("case_id");
CREATE INDEX mv_fynccosp_date_idx ON public.five_year_non_cr3_crashes_outside_surface_polygons USING btree ("date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_all_crashes_outside_surface_polygons as
SELECT 1 as non_cr3, 0 as cr3, case_id as crash_id, date as date, speed_mgmt_points as speed_mgmt_points, est_comp_cost as est_comp_cost, est_econ_cost, position as geometry,
       0 as sus_serious_injry_cnt, 0 as nonincap_injry_cnt, 0 as poss_injry_cnt, 0 as non_injry_cnt, 0 as unkn_injry_cnt, 0 as tot_injry_cnt, 0 as death_cnt
FROM five_year_non_cr3_crashes_outside_surface_polygons
UNION
SELECT 0 as non_cr3, 1 as cr3, crash_id as crash_id, crash_date as date, speed_mgmt_points as speed_mgmt_points, est_comp_cost as est_comp_cost, est_econ_cost, position as geometry,
       sus_serious_injry_cnt, nonincap_injry_cnt, poss_injry_cnt, non_injry_cnt, unkn_injry_cnt, tot_injry_cnt, death_cnt
FROM five_year_cr3_crashes_outside_surface_polygons;
CREATE INDEX mv_fyacosp_geometry_idx ON public.five_year_all_crashes_outside_surface_polygons USING gist ("geometry");
CREATE INDEX mv_fyacosp_crash_id_idx ON public.five_year_all_crashes_outside_surface_polygons USING btree ("crash_id");
CREATE INDEX mv_fyacosp_deaths_idx ON public.five_year_all_crashes_outside_surface_polygons USING btree ("death_cnt");
CREATE INDEX mv_fyacosp_date_idx ON public.five_year_all_crashes_outside_surface_polygons USING btree ("date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_all_crashes_outside_any_polygons as
SELECT c.*
FROM five_year_all_crashes_outside_surface_polygons c
         LEFT JOIN atd_txdot_locations p ON (
        (p.location_group = 2)
        AND p.geometry && c.geometry AND ST_Contains(p.geometry, c.geometry))
WHERE p.polygon_hex_id is NULL;
CREATE INDEX mv_fyacoap_geometry_idx on public.five_year_all_crashes_outside_any_polygons USING gist ("geometry");
CREATE INDEX mv_fyacoap_crash_id_idx ON public.five_year_all_crashes_outside_any_polygons USING btree ("crash_id");
CREATE INDEX mv_fyacoap_deaths_idx ON public.five_year_all_crashes_outside_any_polygons USING btree ("death_cnt");
CREATE INDEX mv_fyacoap_date_idx ON public.five_year_all_crashes_outside_any_polygons USING btree ("date");


CREATE MATERIALIZED VIEW IF NOT EXISTS five_year_highway_polygons_with_crash_data as
SELECT p.location_id, p.road, p.intersection, p.road_name, p.level_1, p.level_2, p.level_3, p.level_4, p.level_5, p.street_level, p.is_intersection, p.council_district, p.sidewalk_score, p.bicycle_score, p.transit_score, p.community_dest_score, p.minority_score, p.poverty_score,
-- p.sidewalk_score + p.bicycle_score + p.transit_score + p.community_dest_score + p.minority_score + p.poverty_score,
       SUM(c.sus_serious_injry_cnt) as total_sus_serious_injry_cnt,
       SUM(c.nonincap_injry_cnt) as total_nonincap_injry_cnt,
       SUM(c.poss_injry_cnt) as total_poss_injry_cnt,
       SUM(c.non_injry_cnt) as total_non_injry_cnt,
       SUM(c.unkn_injry_cnt) as total_unkn_injry_cnt,
       SUM(c.tot_injry_cnt) as total_tot_injry_cnt,
       SUM(c.death_cnt) as total_death_cnt,
       SUM(c.est_comp_cost) as sum_comp_cost,
       SUM(c.est_econ_cost) as sum_econ_cost,
       SUM(c.non_cr3) as non_cr3_count,
       SUM(c.cr3) as cr3_count,
       SUM(c.non_cr3) + SUM(c.cr3) as total_crash_count,
       p.geometry
FROM atd_txdot_locations p
         LEFT JOIN five_year_all_crashes_outside_surface_polygons c on (c.geometry && p.geometry AND ST_CONTAINS(p.geometry, c.geometry))
WHERE (p.location_group = 2)
GROUP BY p.location_id;
CREATE INDEX mv_fyhpwcd_geometry_idx ON public.five_year_highway_polygons_with_crash_data USING gist ("geometry");
CREATE INDEX mv_fyhpwcd_location_id_idx ON public.five_year_highway_polygons_with_crash_data USING btree ("location_id");
CREATE INDEX mv_fyhpwcd_deaths_idx ON public.five_year_highway_polygons_with_crash_data USING btree ("total_death_cnt");

