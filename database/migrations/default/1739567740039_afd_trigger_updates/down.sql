alter table afd__incidents 
    drop constraint unique_incident_number,
    alter column calendar_year type text using (calendar_year::text),
    alter column flagged_incs type text using (flagged_incs::text);

drop trigger if exists afd_incidents_trigger_insert on afd__incidents;
drop trigger if exists afd_incidents_trigger_update on afd__incidents;

create trigger afd_incidents_trigger_insert after insert on afd__incidents for each row execute function afd_incidents_trigger();
create trigger afd_incidents_trigger_update after update on afd__incidents for each row when (
    old.latitude is distinct from new.latitude
    or old.longitude is distinct from new.longitude
    or old.ems_incident_numbers is distinct from new.ems_incident_numbers
    or old.call_datetime is distinct from new.call_datetime
)
execute function afd_incidents_trigger();

CREATE OR REPLACE FUNCTION public.afd_incidents_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  WITH jurisdiction_union AS (
    SELECT ST_Union(geometry) AS geometry
    FROM geo.jurisdictions
    WHERE jurisdiction_label = 'AUSTIN FULL PURPOSE'
  )
  UPDATE afd__incidents
  SET
    austin_full_purpose = (
      SELECT ST_Contains(jurisdiction_union.geometry, incidents.geometry)
      FROM afd__incidents incidents, jurisdiction_union
      WHERE incidents.id = NEW.id
    ),
    location_id = (
      SELECT locations.location_id
      FROM afd__incidents incidents
      JOIN atd_txdot_locations locations ON (
        TRUE
        AND locations.location_group = 1 -- This was added to rule out old level 5s
        AND incidents.geometry && locations.geometry
        AND ST_Contains(locations.geometry, incidents.geometry)
      )
      WHERE incidents.id = NEW.id
    ),
    latitude = ST_Y(afd__incidents.geometry),
    longitude = ST_X(afd__incidents.geometry),
    ems_incident_number_1 = afd__incidents.ems_incident_numbers[1],
    ems_incident_number_2 = afd__incidents.ems_incident_numbers[2],
    call_date = DATE(afd__incidents.call_datetime),
    call_time = afd__incidents.call_datetime::TIME
  WHERE afd__incidents.id = NEW.id;

  RETURN NEW;
END;
$function$;

