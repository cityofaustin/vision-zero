-- delete ems_incidents with the same pcr_key, keeping the first of any dupes
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

-- drop old triggers
drop trigger if exists ems_incidents_trigger_insert on ems__incidents;
drop trigger if exists ems_incidents_trigger_update on ems__incidents;

-- make mvc_form_extrication_datetime timezone aware
alter table ems__incidents add column mvc_form_extrication_datetime_tz timestamptz;
update ems__incidents set
    mvc_form_extrication_datetime_tz = mvc_form_extrication_datetime at time zone 'America/Chicago';
alter table ems__incidents drop column mvc_form_extrication_datetime;
alter table ems__incidents rename column mvc_form_extrication_datetime_tz to mvc_form_extrication_datetime;

-- drop these two columns which were generated via trigger from mvc_form_extrication_datetime 
alter table ems__incidents drop column mvc_form_time, drop column mvc_form_date;

-- drop redundant lat/lon columns;
alter table ems__incidents drop column incident_location_latitude, drop column incident_location_longitude;

-- create new incident_received_datetime column and drop old columns
alter table ems__incidents add column incident_received_datetime timestamptz;
update ems__incidents set
    incident_received_datetime = (incident_date_received || ' ' || incident_time_received)::timestamp at time zone 'america/chicago';
alter table ems__incidents drop column incident_date_received, drop column incident_time_received;

-- add audit fields and updated_at trigger;
alter table ems__incidents add column created_at timestamptz default now();
alter table ems__incidents add column updated_at timestamptz default now();
create trigger set_public_ems__incidents_updated_at before update on public.ems__incidents for each row execute function public.set_current_timestamp_updated_at();

-- create new trigger function
create or replace function public.ems_incidents_trigger()
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
    (NEW.apd_incident_numbers)[1],
    (NEW.apd_incident_numbers)[2]
  INTO 
    NEW.austin_full_purpose,
    NEW.location_id,
    NEW.apd_incident_number_1,
    NEW.apd_incident_number_2
  FROM (SELECT 1) AS dummy
  LEFT JOIN atd_txdot_locations locations ON (
    locations.location_group = 1 
    AND NEW.geometry && locations.geometry 
    AND ST_Contains(locations.geometry, NEW.geometry)
  );
  RETURN NEW;
END;
$function$;

-- create new BEFORE triggers
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
) execute function ems_incidents_trigger();
