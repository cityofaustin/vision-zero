drop trigger if exists afd_incidents_trigger_insert on public.afd__incidents;

drop trigger if exists afd_incidents_trigger_update on public.afd__incidents;


drop function public.afd_incidents_trigger ();

create or replace function public.afd_incidents_trigger()
returns trigger
language plpgsql
as $function$
BEGIN
  update afd__incidents set
    austin_full_purpose = (
      select ST_Contains(jurisdiction.geometry, incidents.geometry)
      from afd__incidents incidents
      left join geo.jurisdictions jurisdiction on (jurisdiction.jurisdiction_label = 'AUSTIN FULL PURPOSE')
      where incidents.id = new.id),
    location_id = (
      select locations.location_id
      from afd__incidents incidents
      join atd_txdot_locations locations on (
        true
        and locations.location_group = 1 -- this was added to rule out old level 5s
        and incidents.geometry && locations.geometry
        and ST_Contains(locations.geometry, incidents.geometry)
      )
      where incidents.id = new.id),
    latitude = ST_Y(afd__incidents.geometry),
    longitude = ST_X(afd__incidents.geometry),
    ems_incident_number_1 = afd__incidents.ems_incident_numbers[1],
    ems_incident_number_2 = afd__incidents.ems_incident_numbers[2],
    call_date = date(afd__incidents.call_datetime),
    call_time = afd__incidents.call_datetime::time
    where afd__incidents.id = new.id;
RETURN NEW;
END;
$function$;


create trigger afd_incidents_trigger_insert after
insert
on
public.afd__incidents for each row execute function afd_incidents_trigger();


create trigger afd_incidents_trigger_update after
update
on
public.afd__incidents for each row
when (
    (
        false
        or (
            old.geometry is distinct
            from
            new.geometry
        )
        or (
            old.ems_incident_numbers is distinct
            from
            new.ems_incident_numbers
        )
        or (
            old.call_datetime is distinct
            from
            new.call_datetime
        )
    )
) execute function afd_incidents_trigger();
