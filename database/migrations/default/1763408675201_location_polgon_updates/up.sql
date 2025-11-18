-- remove redundant indexes
ALTER TABLE atd_txdot_locations 
  DROP CONSTRAINT atd_txdot_locations_unique_id_key;

DROP INDEX atd_txdot_locations_unique_id_uindex;

ALTER TABLE atd_txdot_locations rename column description to location_name;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection DROP DEFAULT;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection TYPE bool
    USING CASE WHEN is_intersection = 0 THEN FALSE ELSE TRUE END;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection SET DEFAULT FALSE;

ALTER TABLE atd_txdot_locations
    add column is_signalized boolean,
    add column is_hin boolean,
    add column is_service_road boolean,
    add column council_districts integer[],
    add column signal_eng_areas text[],
    add column area_eng_areas text[],
    add column zip_codes text[],
    add column apd_sectors text[],
    add column street_levels integer[],
    add column signal_id integer,
    add column signal_type text,
    add column signal_status text,
    add column is_deleted boolean not null default false;
