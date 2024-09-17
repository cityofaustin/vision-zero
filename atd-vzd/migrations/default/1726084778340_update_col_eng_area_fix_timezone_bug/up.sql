alter table "public"."crashes" rename column "engineering_area" to "engineering_area_id";

-- update column engineering_area to engineering_area_id
create or replace function public.crashes_set_spatial_attributes()
returns trigger
language plpgsql
as $$
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
        new.in_austin_full_purpose =  st_contains((select geometry from atd_jurisdictions where id = 5), new.position);
        raise debug 'in austin full purpose: % compared to previous: %', new.in_austin_full_purpose, old.in_austin_full_purpose;
        --
        -- get council district
        --
        new.council_district = (
            select
                council_district
            from
                public.council_districts
            where
                st_contains(geometry, new.position)
            limit 1);
        raise debug 'council_district: % compared to previous: %', new.council_district, old.council_district;
        --
        -- get engineering area
        --
        new.engineering_area_id = (
            select
                area_id
            from
                public.engineering_areas
            where
                st_contains(geometry, new.position)
            limit 1);
        raise debug 'engineering_area_id: % compared to previous: %', new.engineering_area_id, old.engineering_area_id;
        else
            raise debug 'setting location id and council district to null';
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
    end if;
    return new;
end;
$$;

drop view if exists fatalities_view cascade;

-- fixing a timezone bug in the ytd_fatality and ytd_fatal_crash counts
-- and updating engineering_area to engineering_area_id
create or replace view fatalities_view AS
select 
people.id as person_id,
crashes.id as crash_pk,
crashes.cris_crash_id,
crashes.record_locator,
units.id as unit_id,
CONCAT_WS(' ', people.prsn_first_name, people.prsn_mid_name, people.prsn_last_name) as victim_name,
TO_CHAR(crashes.crash_timestamp at time zone 'US/Central', 'yyyy') AS year,
CONCAT_WS(' ',
  crashes.rpt_block_num,
  crashes.rpt_street_pfx,
  crashes.rpt_street_name,
  '(',
  crashes.rpt_sec_block_num,
  crashes.rpt_sec_street_pfx,
  crashes.rpt_sec_street_name,
  ')') AS location,
to_char(
  public.crashes.crash_timestamp at time zone 'US/Central', 'YYYY-MM-DD'
  ) as crash_date_ct,
to_char(
  public.crashes.crash_timestamp at time zone 'US/Central', 'HH24:MI:SS'
  ) as crash_time_ct,
-- get ytd fatality, partition by year and sort by date timestamp
ROW_NUMBER() OVER (
    PARTITION BY EXTRACT(year FROM crashes.crash_timestamp at time zone 'US/Central') 
    ORDER BY crashes.crash_timestamp at time zone 'US/Central' ASC) 
    AS ytd_fatality,
-- get ytd fatal crash, partition by year and sort by date timestamp.
-- records with the same crash.id will get "tie" rankings thus making
-- this column count each crash rather than each fatality
DENSE_RANK() OVER (
    PARTITION BY EXTRACT(year FROM crashes.crash_timestamp at time zone 'US/Central') 
    ORDER BY crashes.crash_timestamp at time zone 'US/Central' ASC, crashes.id) 
    AS ytd_fatal_crash,
crashes.case_id,
crashes.law_enforcement_ytd_fatality_num,
crashes.engineering_area_id
  from 
    people 
  left join units on people.unit_id = units.id
  left join crashes on units.crash_pk = crashes.id
where crashes.in_austin_full_purpose = true AND people.prsn_injry_sev_id = 4 AND crashes.private_dr_fl = false AND crashes.is_deleted = false;

update _column_metadata SET column_name = 'engineering_area_id' WHERE id = 60;
