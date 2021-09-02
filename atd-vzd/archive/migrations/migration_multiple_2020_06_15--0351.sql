--
-- Frank's Recomendation for changing the projection type
--
ALTER TABLE atd_jurisdictions ALTER COLUMN geometry TYPE geometry(MultiPolygon, 4326) USING ST_Transform(geometry,4326);
ALTER TABLE atd_txdot_locations ALTER COLUMN geometry TYPE geometry(MultiPolygon, 4326) USING ST_Transform(ST_SetSRID(geometry, 2277),4326);
ALTER TABLE atd_txdot_locations ALTER COLUMN shape TYPE geometry(MultiPolygon, 4326) USING ST_Transform(ST_SetSRID(shape, 2277),4326);
ALTER TABLE atd_txdot_locations ALTER COLUMN overlapping_geometry TYPE geometry(MultiPolygon, 4326) USING ST_Transform(ST_SetSRID(overlapping_geometry, 2277),4326);
ALTER TABLE atd_txdot_locations ALTER COLUMN spine TYPE geometry(MultiLineString, 4326) USING ST_Transform(ST_SetSRID(spine, 2277),4326);
ALTER TABLE polygons ALTER COLUMN geometry TYPE geometry(MultiPolygon, 4326) USING ST_Transform(ST_SetSRID(geometry, 2277),4326);
ALTER TABLE polygons ALTER COLUMN overlapping_geometry TYPE geometry(MultiPolygon, 4326) USING ST_Transform(ST_SetSRID(overlapping_geometry, 2277),4326);
ALTER TABLE polygons ALTER COLUMN spine TYPE geometry(MultiLineString, 4326) USING ST_Transform(ST_SetSRID(spine, 2277),4326);
ALTER TABLE atd_txdot_streets ALTER COLUMN shape TYPE geometry(MultiLineString, 4326) USING ST_SetSRID(shape, 4326);
ALTER TABLE council_districts ALTER COLUMN geometry TYPE geometry(MultiPolygon, 4326) USING ST_SetSRID(geometry, 4326);
ALTER TABLE cr3_mainlanes ALTER COLUMN geometry TYPE geometry(MultiLineString, 4326) USING ST_Transform(ST_SetSRID(geometry, 2277),4326);
ALTER TABLE non_cr3_mainlane ALTER COLUMN geometry TYPE geometry(MultiLineString, 4326) USING ST_Transform(ST_SetSRID(geometry, 2277),4326);
ALTER TABLE intersections ALTER COLUMN geometry TYPE geometry(Point, 4326) USING ST_Transform(ST_SetSRID(geometry, 2277),4326);

