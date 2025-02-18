alter table ems__incidents drop constraint unique_pcr_key;

drop trigger if exists ems_incidents_trigger_insert on ems__incidents;
drop trigger if exists ems_incidents_trigger_update on ems__incidents;

create trigger ems_incidents_trigger_insert
after insert
on ems__incidents
for each row
execute function public.ems_incidents_trigger();

create trigger ems_incidents_trigger_update after update on
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
WITH jurisdiction_union AS (
    SELECT ST_Union(geometry) AS geometry
    FROM geo.jurisdictions
    WHERE jurisdiction_label = 'AUSTIN FULL PURPOSE'
  )
  update ems__incidents set
    austin_full_purpose = (
      select ST_Contains(jurisdiction.geometry, incidents.geometry)
      from ems__incidents incidents
      left join jurisdiction_union jurisdiction on TRUE
      where incidents.id = new.id),
    location_id = (
      select locations.location_id
      from ems__incidents incidents
      join atd_txdot_locations locations on (locations.location_group = 1 and incidents.geometry && locations.geometry and ST_Contains(locations.geometry, incidents.geometry))
      where incidents.id = new.id),
    latitude = ST_Y(ems__incidents.geometry),
    longitude = ST_X(ems__incidents.geometry),
    apd_incident_number_1 = ems__incidents.apd_incident_numbers[1],
    apd_incident_number_2 = ems__incidents.apd_incident_numbers[2],
    mvc_form_date = date(ems__incidents.mvc_form_extrication_datetime),
    mvc_form_time = ems__incidents.mvc_form_extrication_datetime::time
    where ems__incidents.id = new.id;
RETURN NEW;
END;
$function$;
