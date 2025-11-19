--
-- we have two redundant indexes that can be removed 
-- they appear to have been created by mistake because
-- atd_txdot_locations_pk constraint covers both of these
--
ALTER TABLE atd_txdot_locations 
  DROP CONSTRAINT atd_txdot_locations_unique_id_key;

DROP INDEX atd_txdot_locations_unique_id_uindex;

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
    add column is_deleted boolean not null default false,
    add column created_at timestamp with time zone DEFAULT now() NOT NULL,
    add column updated_at timestamp with time zone DEFAULT now() NOT NULL,
    add column created_by text not null default 'system',
    add column updated_by text not null default 'system';

-- index the new is_deleted column
CREATE INDEX locations_is_deleted_idx on atd_txdot_locations (is_deleted);

-- copy the values from `last_update` into the new audit fields
UPDATE atd_txdot_locations
    SET created_at = (last_update || ' 00:00:00')::timestamp AT TIME ZONE 'America/Chicago',
    updated_at = (last_update || ' 00:00:00')::timestamp AT TIME ZONE 'America/Chicago';

-- drop the old audit field as well as `scale_factor`, which is unused
    alter table atd_txdot_locations
        drop column last_update,
        drop column scale_factor;

-- attach `updated_at` setter trigger
CREATE TRIGGER set_public_locations_updated_at BEFORE UPDATE ON public.atd_txdot_locations FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- add pk column to non-coa roadways
alter table geo.non_coa_roadways add column objectid integer;
update geo.non_coa_roadways set objectid = 1;
alter table geo.non_coa_roadways add primary key (objectid);

-- rename location description and update view to use location_name and filter is_deleted rows
ALTER TABLE atd_txdot_locations rename column description to location_name;

--
-- Begin table name change
--
alter table atd_txdot_locations rename to locations;

--
-- locations_list_view
--
-- - use new location_name column
-- - add is_deleted filter
-- - update table name
--
DROP VIEW locations_list_view;
CREATE VIEW locations_list_view AS 
 WITH cr3_comp_costs AS (
         SELECT crashes_list_view.location_id,
            sum(crashes_list_view.est_comp_cost_crash_based) AS cr3_comp_costs_total
           FROM crashes_list_view
          WHERE crashes_list_view.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes_list_view.location_id
        ), cr3_crash_counts AS (
         SELECT crashes.location_id,
            count(crashes.location_id) AS crash_count
           FROM crashes
          WHERE crashes.private_dr_fl = false AND crashes.location_id IS NOT NULL AND crashes.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes.location_id
        ), non_cr3_crash_counts AS (
         SELECT atd_apd_blueform.location_id,
            count(atd_apd_blueform.location_id) AS crash_count,
            count(atd_apd_blueform.location_id) * 10000 AS noncr3_comp_costs_total
           FROM atd_apd_blueform
          WHERE atd_apd_blueform.location_id IS NOT NULL AND atd_apd_blueform.is_deleted = false AND atd_apd_blueform.case_timestamp > (now() - '5 years'::interval)
          GROUP BY atd_apd_blueform.location_id
        )
 SELECT locations.location_id,
    locations.location_name,
    locations.council_district,
    locations.location_group,
    COALESCE(cr3_comp_costs.cr3_comp_costs_total + non_cr3_crash_counts.noncr3_comp_costs_total, 0::bigint) AS total_est_comp_cost,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) AS cr3_crash_count,
    COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS non_cr3_crash_count,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) + COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS crash_count
   FROM locations
     LEFT JOIN cr3_crash_counts ON locations.location_id::text = cr3_crash_counts.location_id
     LEFT JOIN non_cr3_crash_counts ON locations.location_id::text = non_cr3_crash_counts.location_id::text
     LEFT JOIN cr3_comp_costs ON locations.location_id::text = cr3_comp_costs.location_id
     where locations.is_deleted = false;

--
-- afd_incidents_trigger
--
CREATE OR REPLACE FUNCTION public.afd_incidents_trigger() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.geometry = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);

    SELECT 
        COALESCE(EXISTS (
            SELECT 1 
            FROM geo.jurisdictions 
            WHERE jurisdiction_label = 'AUSTIN FULL PURPOSE'
            AND ST_Contains(geometry, NEW.geometry)
        ), FALSE),
        locations.location_id,
        (NEW.ems_incident_numbers)[1],
        (NEW.ems_incident_numbers)[2]
    INTO 
        NEW.austin_full_purpose,
        NEW.location_id,
        NEW.ems_incident_number_1,
        NEW.ems_incident_number_2
    FROM (SELECT 1) AS dummy_select
    LEFT JOIN locations ON (
        locations.location_group = 1 
        AND NEW.geometry && locations.geometry 
        AND ST_Contains(locations.geometry, NEW.geometry)
        AND locations.is_deleted = FALSE
    );

  RETURN NEW;
END;
$$;



--
-- crashes_set_spatial_attributes
--
CREATE OR REPLACE FUNCTION public.crashes_set_spatial_attributes() RETURNS trigger
LANGUAGE plpgsql
AS $$
begin
    if (new.latitude is not null and new.longitude is not null) then
        -- save lat/lon into geometry col
        new.position = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326);
        --
        -- get location polygon id
        --
        if (new.rpt_road_part_id != 2 and upper(ltrim(new.rpt_hwy_num)) in ('35', '183','183A','1','290','71','360','620','45','130')) then
            -- use level 5 polygon
            new.location_id = (
                select
                    location_id
                from
                    public.locations
                where
                    location_group = 2 -- level 5
                    and st_contains(geometry, new.position)
                    and is_deleted = false
                limit 1);
        else
            -- use the other polygons
            new.location_id = (
                select
                    location_id
                from
                    public.locations
                where
                    location_group = 1 -- not level 5
                    and st_contains(geometry, new.position)
                    and is_deleted = false
                limit 1);
        end if;

        raise debug 'found location: % compared to previous location: %', new.location_id, old.location_id;
        --
        -- check if in austin full purpose jurisdiction
        --
        new.in_austin_full_purpose = EXISTS (
            select 1 
            from geo.jurisdictions 
            where JURISDICTION_LABEL = 'AUSTIN FULL PURPOSE' AND  ST_Intersects(geometry, new.position)
        );
        raise debug 'in austin full purpose: % compared to previous: %', new.in_austin_full_purpose, old.in_austin_full_purpose;
        --
        -- get council district
        --
        new.council_district = (
            select
                council_district
            from
                geo.council_districts
            where
                st_contains(geometry, new.position)
            limit 1);
        raise debug 'council_district: % compared to previous: %', new.council_district, old.council_district;
        --
        -- get engineering area
        --
        new.engineering_area_id = (
            select
                engineering_area_id
            from
                geo.engineering_areas
            where
                st_contains(geometry, new.position)
            limit 1);
        raise debug 'engineering_area_id: % compared to previous: %', new.engineering_area_id, old.engineering_area_id;
        --
        -- get signal engineer area
        --
        new.signal_engineer_area_id = (
            select
                signal_engineer_area_id
            from
                geo.signal_engineer_areas
            where
                st_contains(geometry, new.position)
            limit 1);
        raise debug 'signal_engineer_area_id: % compared to previous: %', new.signal_engineer_area_id, old.signal_engineer_area_id;
        --
        -- get zip code
        --
        new.zipcode = (
            select
                zipcode
            from
                geo.zip_codes
            where
                st_contains(geometry, new.position)
            limit 1);
        raise debug 'zipcode: % compared to previous: %', new.zipcode, old.zipcode;
        --
        -- get apd sector
        --
        new.apd_sector_id = (
            select
                primary_key
            from
                geo.apd_sectors
            where
                st_contains(geometry, new.position)
            limit 1);
        raise debug 'apd_sector_id: % compared to previous: %', new.apd_sector_id, old.apd_sector_id;
        --
        -- check if is_coa_roadway
        --
        if (new.in_austin_full_purpose and not new.private_dr_fl) then
            new.is_coa_roadway = not st_contains((select geometry from geo.non_coa_roadways), new.position);
            raise debug 'is_coa_roadway: % compared to previous: %', new.is_coa_roadway, old.is_coa_roadway;
        else
            new.is_coa_roadway = false;
        end if;
        else
            raise debug 'resetting spatial attributes due to null latitude and/or longitude values';
            -- nullify position column
            new.position = null;
            -- reset location id
            new.location_id = null;
            -- use city id to determine full purpose jurisdiction
            new.in_austin_full_purpose = coalesce(new.rpt_city_id = 22, false);
            raise debug 'setting in_austin_full_purpose based on city id: %', new.in_austin_full_purpose;
            -- reset council district
            new.council_district = null;
            -- reset engineering area
            new.engineering_area_id = null;
            -- reset signal eng area
            new.signal_engineer_area_id = null;
            -- reset zip code
            new.zipcode = null;
            -- reset apd_sector
            new.apd_sector_id = null;
            -- reset is_non_coa_roadway
            new.is_coa_roadway = false;
    end if;
    return new;
end;
$$;

--
-- ems__incidents trigger
--
CREATE OR REPLACE FUNCTION public.ems_incidents_trigger() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.geometry = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);

  SELECT 
    COALESCE(EXISTS (
      SELECT 1 
      FROM geo.jurisdictions 
      WHERE jurisdiction_label = 'AUSTIN FULL PURPOSE'
      AND ST_Contains(geometry, NEW.geometry)
    ), FALSE),
    locations.location_id
  INTO 
    NEW.austin_full_purpose,
    NEW.location_id
  FROM (SELECT 1) AS dummy
  LEFT JOIN locations ON (
    locations.location_group = 1 
    AND NEW.geometry && locations.geometry 
    AND ST_Contains(locations.geometry, NEW.geometry)
    AND locations.is_deleted = FALSE 
  );
  RETURN NEW;
END;
$$;

--
-- update_noncr3_location
--
CREATE OR REPLACE FUNCTION public.update_noncr3_location() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if crash is on a major road and of concern to TxDOT.
    -- NEW.position is recalculated in a trigger called
    -- atd_txdot_blueform_update_position which runs before this trigger.
    IF EXISTS (
        SELECT
            ncr3m.*
        FROM
            non_cr3_mainlanes AS ncr3m
        WHERE ((NEW.position && ncr3m.geometry)
            AND ST_Contains(ST_Transform(ST_Buffer(ST_Transform(ncr3m.geometry, 2277), 1, 'endcap=flat join=round'), 4326),
                /* transform into 2277 to buffer by a foot, not a degree */
                NEW.position))) THEN
    -- If it is, then set the location_id to None
    NEW.location_id = NULL;
ELSE
    -- If it isn't on a major road and is of concern to Vision Zero, try to find a location_id for it.
    NEW.location_id = (
        SELECT
            location_id
        FROM
            locations AS atl
        WHERE atl.location_group = 1
            AND atl.is_deleted = false
            AND atl.geometry && NEW.position
            AND ST_Contains(atl.geometry, NEW.position)
    );
END IF;
    RETURN NEW;
END;
$$;

--
-- rename atd_txdot_locations_pk constraint
--
ALTER TABLE locations RENAME CONSTRAINT atd_txdot_locations_pk TO locations_pk;

--
-- rename atd_txdot_locations_group_index
--
ALTER INDEX atd_txdot_locations_group_index RENAME TO locations_location_group_idx;

--
-- rename atd_txdot_locations_council_district_idx
--
ALTER INDEX atd_txdot_locations_council_district_idx rename to locations_council_district_idx;

--
-- rename atd_txdot_locations_geometry_index
--
ALTER INDEX atd_txdot_locations_geometry_index rename to locations_geometry_index;
