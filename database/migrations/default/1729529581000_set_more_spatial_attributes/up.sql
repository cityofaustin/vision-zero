
CREATE OR REPLACE FUNCTION public.crashes_set_spatial_attributes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
                    public.atd_txdot_locations
                where
                    location_group = 2 -- level 5
                    and st_contains(geometry, new.position)
                limit 1);
        else
            -- use the other polygons
            new.location_id = (
                select
                    location_id
                from
                    public.atd_txdot_locations
                where
                    location_group = 1 -- not level 5
                    and st_contains(geometry, new.position)
                limit 1);
        end if;

        raise debug 'found location: % compared to previous location: %', new.location_id, old.location_id;
        --
        -- check if in austin full purpose jurisdiction
        --
        new.in_austin_full_purpose =  st_contains((select geometry from geo.atd_jurisdictions where id = 5), new.position);
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
        -- check if is_non_coa_roadway
        --
        if (new.in_austin_full_purpose or new.rpt_city_id = 22) then
            new.is_non_coa_roadway = st_contains((select geometry from geo.non_coa_roadways), new.position);
            raise debug 'is_non_coa_roadway: % compared to previous: %', new.is_non_coa_roadway, old.is_non_coa_roadway;
        end if;
        else
            raise debug 'reseting spatial attributes due to null latitude and/or longitude values';
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
            new.is_non_coa_roadway = true;
    end if;
    return new;
end;
$function$