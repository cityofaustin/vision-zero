--
-- rename fk column to crash_pk and add fk constraint
--
alter table ems__incidents rename column crash_id to crash_pk;
alter table ems__incidents
add constraint ems__incidents_crashes_crash_pk_fkey foreign key (crash_pk)
references public.crashes (id) on update cascade on delete set null;

comment on column ems__incidents.crash_pk is 'Crash ID matched to this record';

--
-- add people fk column
--
alter table ems__incidents
add column person_id integer unique deferrable initially deferred,
add constraint ems__incidents_person_id foreign key (
    person_id
) references people (id);

comment on column ems__incidents.person_id is 'Person ID matched to this record';

--
-- add column to track match metadata and multiple crash_pks
--
alter table ems__incidents
add column crash_match_status text default 'unmatched'
check (
    crash_match_status in (
        'unmatched',
        'matched_by_automation',
        'multiple_matches_by_automation',
        'matched_by_manual_qa'
    )
),
add column matched_crash_pks integer [],
add constraint matched_crash_pks_non_null check (
    (crash_match_status = 'multiple_matches_by_automation')
    or (matched_crash_pks is NULL)
);
comment on column ems__incidents.crash_match_status is 'The status of the crash record match';
comment on column ems__incidents.matched_crash_pks is 'The IDs of multiple crashes that were found to match this record. Can only be populated when crash_match_status is ''multiple_matches_by_automation''';

--
-- add column to assign injury severity
--
alter table ems__incidents
add column patient_injry_sev_id integer generated always as (
    case
        when
            lower(pcr_provider_impression_primary) = 'death on scene'
            or lower(pcr_outcome) = 'deceased on scene'
            or lower(pcr_patient_acuity_final)
            = 'dead without resuscitation efforts (black)'
            then 4
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_final) = 'lower acuity (green)'
            then 2
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_final) = 'critical (red)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_final) = 'emergent (yellow)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_initial) = 'critical (red)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_initial) = 'emergent (yellow)'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_level) = 'high acuity'
            then 1
        -- what is this pcr_transport_priority?
        when
            upper(left(pcr_transport_priority, 1)) = 'CHARLIE'
            or upper(left(pcr_transport_priority, 1)) = 'D'
            then 1
        when
            right(pcr_transport_priority, 1) = '3'
            and lower(pcr_patient_acuity_initial) = 'lower acuity (green)'
            then 2
        when
            upper(left(pcr_transport_priority, 1)) = 'minor injury'
            or upper(left(pcr_transport_priority, 1)) = 'possible injury'
            then 2
        when
            right(pcr_transport_priority, 1) != '3'
            and lower(pcr_patient_acuity_initial) = 'lower acuity (green)'
            then 3
        when
            upper(right(pcr_outcome, 7)) = 'REFUSED'
            and left(lower(pcr_patient_acuity_level), 10) = 'low acuity'
            then 3
        else 5
    end
) stored;

alter table ems__incidents
add constraint ems__incidents_patient_injry_sev_id_fk foreign key (
    patient_injry_sev_id
)
references lookups.injry_sev on update restrict on delete restrict;

comment on column ems__incidents.patient_injry_sev_id is 'The patient injury severity as mapped to the CRIS injury severity lookup';

--
-- add travel_mode column
--
alter table ems__incidents
add column travel_mode text generated always as (
    case
        when lower(mvc_form_vehicle_type) = 'motorcycle' then 'Motorcycle'
        when lower(mvc_form_vehicle_type) = 'moped' then 'Motorcycle'
        -- todo: dicuss with Xavier, he had this as the second-two-last case
        when lower(mvc_form_vehicle_type) = 'motorized scooter' then 'E-Scooter'
        when lower(pcr_cause_of_injury) like '%motorcy%' then 'Motorcycle'
        when
            lower(pcr_cause_of_injury) like '%scoot%'
            or lower(pcr_patient_complaints) like '%scoot%'
            then 'E-Scooter'
        when
            lower(pcr_cause_of_injury) like '%bike%'
            or lower(pcr_cause_of_injury) like '%bicy%'
            or lower(pcr_patient_complaints) like '%bike%'
            or lower(pcr_patient_complaints) like '%bicy%'
            then 'Bicycle'
        when
            lower(pcr_cause_of_injury) like '%pede%'
            or lower(pcr_patient_complaints) like '%pede%'
            or (
                lower(pcr_cause_of_injury) like '%auto%'
                and lower(pcr_cause_of_injury) like '%ped%'
            )
            or (
                lower(pcr_patient_complaints) like '%auto%'
                and lower(pcr_patient_complaints) like '%ped%'
            )
            then 'Pedestrian'
        when
            lower(pcr_cause_of_injury) like '%motorcy%'
            or lower(pcr_patient_complaints) like '%mc %'
            then 'Motorcycle'
        else 'Motor Vehicle'
    end
) stored;


--
-- add some indexes
--
create index ems__incidents_crashes_crash_pk_index on public.ems__incidents (
    crash_pk
);
create index ems__incidents_crashes_incident_received_datetime_index
on public.ems__incidents (incident_received_datetime);
create index ems__incidents_apd_incident_numbers_index on ems__incidents using gin (
    apd_incident_numbers
);
create index ems__incidents_geometry_index on ems__incidents using gist (
    geometry
);
create index ems__incidents_patient_injry_sev_id_index on ems__incidents (
    patient_injry_sev_id
);
create index ems__incidents_crash_match_status_index on ems__incidents (
    crash_match_status
);
create index crashes_case_id_index on crashes (case_id);
create index crashes_is_temp_record_index on crashes (
    is_temp_record
);
-- these indexes optimize our ST_DWithin operations, which require geography types and are the fastes way to check point-to-point proximity
create index idx_ems_geometry_geography on ems__incidents using gist (
    (geometry::geography)
);
create index idx_crashes_position_geography on crashes using gist (
    (position::geography)
);

--
-- Create or replace the trigger function for the crashes table
--
create or replace function update_crash_ems_match()
returns trigger as $$
DECLARE
    matching_ems RECORD;
    ems_record RECORD;
    match_count INTEGER;
    matched_crash_ids INTEGER[];
    meters_threshold INTEGER := 1200;
    time_threshold INTERVAL := '30 minutes';
BEGIN
    -- Find all EMS records near the crash location + time
    FOR matching_ems IN (
        SELECT 
            e.id,
            e.incident_received_datetime,
            e.geometry
        FROM 
            ems__incidents e
        WHERE
            -- ignore manual qa matches: these should not be modified
            e.crash_match_status != 'matched_by_manual_qa'
            AND e.incident_received_datetime  >= (NEW.crash_timestamp - time_threshold)
            AND e.incident_received_datetime  <= (NEW.crash_timestamp + time_threshold)
            AND e.geometry IS NOT NULL
            AND NEW.position IS NOT NULL
            -- todo: try use_spheroid = false
            AND ST_DWithin(e.geometry::geography, NEW.position::geography, meters_threshold)
    ) LOOP
        -- Find all crashes which match this EMS record location + time
        SELECT 
            ARRAY(
                SELECT c.id
                FROM crashes c
                WHERE 
                    c.is_deleted = false
                    and not c.is_temp_record
                    AND matching_ems.incident_received_datetime  >= (c.crash_timestamp - time_threshold)
                    AND matching_ems.incident_received_datetime  <= (c.crash_timestamp + time_threshold)
                    AND c.position IS NOT NULL
                    AND ST_DWithin(matching_ems.geometry::geography, c.position::geography, meters_threshold)
            ) INTO matched_crash_ids;
            
        -- Get the count from the array length (handling when array_length is null as 0)
        SELECT COALESCE(array_length(matched_crash_ids, 1), 0) INTO match_count;
        
        IF match_count = 0 THEN
            UPDATE ems__incidents 
            SET crash_pk = NULL,
                crash_match_status = 'unmatched',
                matched_crash_pks = NULL
            WHERE id = matching_ems.id;
        ELSIF match_count = 1 THEN
            -- this EMS record is only matched to one crash - we can assign the crash_pk
            UPDATE ems__incidents 
            SET crash_pk = NEW.id,
                crash_match_status = 'matched_by_automation',
                matched_crash_pks = NULL
            WHERE id = matching_ems.id;
        ELSE
            -- multiple matching crashes found - cannot assign crash_pk
            UPDATE ems__incidents 
            SET crash_match_status = 'multiple_matches_by_automation',
                crash_pk = NULL,
                matched_crash_pks = matched_crash_ids
            WHERE id = matching_ems.id;
        END IF;
    END LOOP;

    --
    -- nullify the crash_pk for EMS records that no longer match this crash
    --
    IF TG_OP = 'UPDATE' THEN
        UPDATE ems__incidents
        SET crash_pk = NULL,
            crash_match_status = 'unmatched',
            matched_crash_pks = NULL
        WHERE crash_pk = NEW.id
          AND (
              incident_received_datetime  < (NEW.crash_timestamp - time_threshold)
              OR incident_received_datetime  > (NEW.crash_timestamp + time_threshold)
              OR geometry IS NULL
              OR NEW.position IS NULL
              OR NEW.is_temp_record is TRUE
              or NEW.is_deleted is TRUE
              OR (NOT ST_DWithin(geometry::geography, NEW.position::geography, meters_threshold))
          )
          AND 
            -- ignore manual qa matches: these should not be modified
            crash_match_status != 'matched_by_manual_qa';
    END IF;
    RETURN NEW;
END;
$$ language plpgsql;


--
-- create insert trigger
--
create or replace trigger crash_insert_ems_match_trigger
after insert on crashes
for each row execute function update_crash_ems_match();

--
-- create update trigger
--
create or replace trigger crash_update_ems_match_trigger
after update on crashes
for each row when (
    (new.latitude is distinct from old.latitude)
    or (new.longitude is distinct from old.longitude)
    or (new.crash_timestamp is distinct from old.crash_timestamp)
) execute function update_crash_ems_match();


--
-- remove apd_incident_number parsing from this trigger
--
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

-- 
-- remove incident numbers from trigger condition
--
drop trigger if exists ems_incidents_trigger_update on ems__incidents;

create trigger ems_incidents_trigger_update before update on ems__incidents for each row
when (
    old.latitude is distinct from new.latitude
    or old.longitude is distinct from new.longitude
)
execute function ems_incidents_trigger();

--
-- drop these individual incident number columns. a record may contain dozens of apd_incident_numbers
-- 
alter table ems__incidents drop column if exists apd_incident_number_1;
alter table ems__incidents drop column if exists apd_incident_number_2;

--
-- drop redundant ems_id column and rebuild people_list_view
--
alter table people drop column if exists ems_id cascade;

create view people_list_view as (
    select
        people.id,
        people.created_at,
        people.created_by,
        people.drvr_city_name,
        people.drvr_drg_cat_1_id,
        people.drvr_zip,
        people.est_comp_cost_crash_based,
        people.is_deleted,
        people.is_primary_person,
        people.prsn_age,
        people.prsn_alc_rslt_id,
        people.prsn_alc_spec_type_id,
        people.prsn_bac_test_rslt,
        people.prsn_death_timestamp,
        people.prsn_drg_rslt_id,
        people.prsn_drg_spec_type_id,
        people.prsn_ethnicity_id,
        people.prsn_exp_homelessness,
        people.prsn_first_name,
        people.prsn_gndr_id,
        people.prsn_helmet_id,
        people.prsn_injry_sev_id,
        people.prsn_last_name,
        people.prsn_mid_name,
        people.prsn_name_sfx,
        people.prsn_nbr,
        people.prsn_occpnt_pos_id,
        people.prsn_rest_id,
        people.prsn_taken_by,
        people.prsn_taken_to,
        people.prsn_type_id,
        people.unit_id,
        people.updated_at,
        people.updated_by,
        people.years_of_life_lost,
        crashes.id as crash_pk,
        crashes.cris_crash_id,
        crashes.crash_timestamp,
        injry_sev.label as prsn_injry_sev_desc,
        units.unit_nbr,
        units.unit_desc_id,
        mode_category.label as mode_desc
    from people
    left join units as units on people.unit_id = units.id
    left join people_cris as people_cris on people.id = people_cris.id
    left join crashes as crashes on units.crash_pk = crashes.id
    left join lookups.injry_sev on people.prsn_injry_sev_id = injry_sev.id
    left join
        lookups.mode_category
        on units.vz_mode_category_id = mode_category.id
);
