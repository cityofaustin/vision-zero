drop trigger if exists crash_insert_ems_match_trigger on crashes;
drop trigger if exists crash_update_ems_match_trigger on crashes;
drop function update_crash_ems_match();
alter table ems__incidents drop column apd_case_ids;
alter table ems__incidents rename column crash_pk to crash_id;
alter table ems__incidents drop column crash_match_status;
alter table ems__incidents drop column matched_crash_pks;
alter table ems__incidents drop column patient_injry_sev;
alter table ems__incidents drop column person_id;
alter table ems__incidents drop column travel_mode;
drop index ems__incidents_crashes_crash_pk_index;
drop index ems__incidents_crashes_incident_received_datetime_index;
drop index ems__incidents_apd_incident_numbers_index;
drop index ems__incidents_geometry_index;
drop index crashes_case_id_index;
drop index crashes_is_temp_record_index;
drop index idx_ems_geometry_geography;
drop index idx_crashes_position_geography;
drop index ems__incidents_patient_injry_sev_index;
drop index ems__incidents_crash_match_status_index;

--
-- restore apd_incident_number parsing
--
alter table ems__incidents add drop column apd_incident_number_1 integer;
alter table ems__incidents add drop column apd_incident_number_2 integer;

CREATE OR REPLACE FUNCTION public.ems_incidents_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.geometry = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);

  SELECT 
    COALESCE(EXISTS (
      SELECT 1 
      FROM geo.jurisdictions 
      WHERE jurisdiction_label = 'AUSTIN FULL PURPOSE'
      AND ST_Contains(geometry, NEW.geometry)
    ), FALSE),
    locations.location_id
  INTO 
    NEW.austin_full_purpose,
    NEW.location_id
  FROM (SELECT 1) AS dummy
  LEFT JOIN atd_txdot_locations locations ON (
    locations.location_group = 1 
    AND NEW.geometry && locations.geometry 
    AND ST_Contains(locations.geometry, NEW.geometry)
  );
  RETURN NEW;
END;
$function$;

drop trigger if exists ems_incidents_trigger_update on ems__incidents;

create trigger ems_incidents_trigger_update before update on ems__incidents for each row
    when (
        old.latitude is distinct from new.latitude
        or old.longitude is distinct from new.longitude
        or old.apd_incident_numbers is distinct from new.apd_incident_numbers
    )
    execute function ems_incidents_trigger();
