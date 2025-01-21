create or replace function public.afd_incidents_trigger()
returns trigger
language plpgsql
as $function$
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
      left join jurisdiction_union jurisdiction on (jurisdiction.jurisdiction_label = 'AUSTIN FULL PURPOSE')
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
