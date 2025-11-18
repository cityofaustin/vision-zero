-- remove redundant indexes
ALTER TABLE atd_txdot_locations 
  DROP CONSTRAINT atd_txdot_locations_unique_id_key;

DROP INDEX atd_txdot_locations_unique_id_uindex;

-- this column is being renamed
ALTER TABLE atd_txdot_locations rename column description to location_name;

-- convert is_intersection to boolean
ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection DROP DEFAULT;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection TYPE bool
    USING CASE WHEN is_intersection = 0 THEN FALSE ELSE TRUE END;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection SET DEFAULT FALSE;

-- add new fields
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

-- add pk column to non-coa roadways
alter table geo.non_coa_roadways add column objectid integer;
update geo.non_coa_roadways set objectid = 1;
alter table geo.non_coa_roadways add primary key (objectid);
