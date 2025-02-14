-- delet ems_incidents with the same pcr_key, keeping the first of any dupes
with numbered_rows as (
    select
        id,
        pcr_key,
        row_number() over (partition by pcr_key order by id) as row_num
    from ems__incidents
)

delete from ems__incidents
where id in (
    select id
    from numbered_rows
    where row_num > 1
);

-- add unique constraint
alter table ems__incidents add constraint unique_pcr_key unique (pcr_key);

-- make ems trigger compatible with on insert rather than after
drop trigger if exists ems_incidents_trigger_insert on ems__incidents;
drop trigger if exists ems_incidents_trigger_update on ems__incidents;

create trigger ems_incidents_trigger_insert
before insert
on ems__incidents
for each row
execute function public.ems_incidents_trigger();

create trigger ems_incidents_trigger_update before update on
ems__incidents for each row when (
    old.latitude is distinct from new.latitude
    or old.longitude is distinct from new.longitude
    or old.apd_incident_numbers is distinct from new.apd_incident_numbers
    or old.mvc_form_extrication_datetime is distinct from new.mvc_form_extrication_datetime
) execute function ems_incidents_trigger();

create or replace function public.ems_incidents_trigger()
returns trigger
language plpgsql
as $function$
BEGIN
  -- First construct the geometry from lat/long
  NEW.geometry = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);

  WITH jurisdiction_union AS (
    SELECT ST_Union(geometry) AS geometry
    FROM geo.jurisdictions
    WHERE jurisdiction_label = 'AUSTIN FULL PURPOSE'
  )
  SELECT 
    COALESCE(ST_Contains(jurisdiction.geometry, NEW.geometry), FALSE),
    locations.location_id,
    NEW.latitude,
    NEW.longitude,
    (NEW.apd_incident_numbers)[1],
    (NEW.apd_incident_numbers)[2],
    date(NEW.mvc_form_extrication_datetime),
    NEW.mvc_form_extrication_datetime::time
  INTO 
    NEW.austin_full_purpose,
    NEW.location_id,
    NEW.latitude,
    NEW.longitude,
    NEW.apd_incident_number_1,
    NEW.apd_incident_number_2,
    NEW.mvc_form_date,
    NEW.mvc_form_time
  FROM jurisdiction_union jurisdiction
  LEFT JOIN atd_txdot_locations locations ON (
    locations.location_group = 1 
    AND NEW.geometry && locations.geometry 
    AND ST_Contains(locations.geometry, NEW.geometry)
  );
  RETURN NEW;
END;
$function$;
