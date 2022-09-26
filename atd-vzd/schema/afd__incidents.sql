DROP TABLE public.afd__incidents;

-- Table Definition
CREATE TABLE "public"."afd__incidents" (
    id serial primary key,
    incident_number integer,
    crash_id integer default null,
    unparsed_ems_incident_number text default null,
    ems_incident_numbers integer[] default null,
    call_datetime timestamp default null,
    calendar_year text default null,
    jurisdiction text default null,
    address text default null,
    problem text default null,
    flagged_incs text default null,
    geometry geometry(Point,4326) default null,
    austin_full_purpose bool default null,
    location_id text default null,
    latitude float8 default null,
    longitude float8 default null,
    ems_incident_number_1 integer default null,
    ems_incident_number_2 integer default null,
    call_date date default null,
    call_time time default null 
);

CREATE OR REPLACE FUNCTION afd_incidents_trigger()
  RETURNS trigger AS
$$
BEGIN
  update afd__incidents set
    austin_full_purpose = (
      select ST_Contains(jurisdiction.geometry, incidents.geometry)
      from afd__incidents incidents
      left join atd_jurisdictions jurisdiction on (jurisdiction.jurisdiction_label = 'AUSTIN FULL PURPOSE')
      where incidents.id = new.id),
    location_id = (
      select locations.location_id
      from afd__incidents incidents
      join atd_txdot_locations locations on (incidents.geometry && locations.shape and ST_Contains(locations.shape, incidents.geometry))
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
$$
LANGUAGE 'plpgsql';

create trigger afd_incidents_trigger_insert
after insert on public.afd__incidents
for each row execute procedure afd_incidents_trigger();

create trigger afd_incidents_trigger_update
after update on public.afd__incidents
for each row 
WHEN (false 
  or OLD.geometry IS DISTINCT FROM NEW.geometry
  or old.ems_incident_numbers is distinct from new.ems_incident_numbers
  or old.call_datetime is distinct from new.call_datetime)
execute procedure afd_incidents_trigger();
