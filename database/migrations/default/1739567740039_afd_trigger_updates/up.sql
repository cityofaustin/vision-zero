-- drop old incident trigger and function
drop trigger if exists afd_incidents_trigger_insert on afd__incidents;
drop trigger if exists afd_incidents_trigger_update on afd__incidents;
drop function if exists public.afd_incidents_trigger ();

-- add unique constraint to incident number
-- make calendar_year a numeric column
-- make flagged_incs a numeric column
alter table afd__incidents
add constraint unique_incident_number unique (incident_number),
alter column calendar_year type integer using (calendar_year::integer),
alter column flagged_incs type integer using (flagged_incs::integer);

-- make call_datetime tz aware and drop redundant call_date and call_time columns
alter table afd__incidents add column call_datetime_tz timestamptz;
update afd__incidents set
    call_datetime_tz = call_datetime at time zone 'America/Chicago';
alter table afd__incidents drop column call_datetime;
alter table afd__incidents rename column call_datetime_tz to call_datetime;
alter table afd__incidents drop column call_date, drop column call_time;

-- add audit fields and updated_at trigger;
alter table afd__incidents add column created_at timestamptz not null default now();
alter table afd__incidents add column updated_at timestamptz not null default now();
create trigger set_public_afd__incidents_updated_at before update on public.afd__incidents for each row execute function public.set_current_timestamp_updated_at();

create function public.afd_incidents_trigger()
returns trigger
language plpgsql
as $function$
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
    LEFT JOIN atd_txdot_locations locations ON (
        locations.location_group = 1 
        AND NEW.geometry && locations.geometry 
        AND ST_Contains(locations.geometry, NEW.geometry)
    );

  RETURN NEW;
END;
$function$;

create trigger afd_incidents_trigger_insert before insert on afd__incidents for each row execute function afd_incidents_trigger();
create trigger afd_incidents_trigger_update before update on afd__incidents for each row when (
    old.latitude is distinct from new.latitude
    or old.longitude is distinct from new.longitude
    or old.ems_incident_numbers is distinct from new.ems_incident_numbers
)
execute function afd_incidents_trigger();
