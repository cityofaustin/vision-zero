-- todo: modify AFD/EMS ETL to do nothing on conflict?

-- rename fk column to crash_pk and add fk constraint
alter table ems__incidents rename column crash_id to crash_pk;
alter table ems__incidents
add constraint ems__incidents_crashes_crash_pk_fkey foreign key (crash_pk)
references public.crashes (id) on update cascade on delete set null;

comment on column ems__incidents.crash_pk is 'Crash ID matched to this record';

alter table ems__incidents add column person_id integer,
add constraint ems__incidents_person_id foreign key (
    person_id
) references people (id);

comment on column ems__incidents.person_id is 'Person ID matched to this record';

--
-- i don't think we need this column or index anymore
--
-- -- add generated array of stringified case IDs bc crash case IDs are strings :/
-- alter table ems__incidents add column apd_case_ids text[] generated always as (
--     apd_incident_numbers::text[]
-- ) stored;
-- create index ems__incidents_apd_case_ids_index on ems__incidents using gin (apd_case_ids);

-- add column to track match metadata
alter table ems__incidents add column match_status text default 'unmatched';
comment on column ems__incidents.match_status is 'The status of the crash record match - updated by update_crash_ems_match trigger';

-- add column to assign injury severity
alter table ems__incidents
add column patient_injry_sev integer generated always as (
    case
        when lower(pcr_provider_impression_primary) = 'death on scene' then 4
        when pcr_outcome = 'DECEASED ON SCENE' then 4
        when
            pcr_patient_acuity_final
            = 'DEAD WITHOUT RESUSCITATION EFFORTS (BLACK)'
            then 4
        when
            upper(right(pcr_transport_priority, 1)) = '3'
            and lower(pcr_patient_acuity_final) = 'lower acuity (green)'
            then 2
        when
            upper(right(pcr_transport_priority, 1)) = '3'
            and lower(pcr_patient_acuity_final) = 'critical (red)'
            then 1
        when
            upper(right(pcr_transport_priority, 1)) = '3'
            and lower(pcr_patient_acuity_final) = 'emergent (yellow)'
            then 1
        when
            upper(right(pcr_transport_priority, 1)) = '3'
            and lower(pcr_patient_acuity_initial) = 'critical (red)'
            then 1
        when
            upper(right(pcr_transport_priority, 1)) = '3'
            and lower(pcr_patient_acuity_initial) = 'emergent (yellow)'
            then 1
        when
            upper(right(pcr_transport_priority, 1)) = '3'
            and lower(pcr_patient_acuity_level) = 'high acuity'
            then 1
        -- what is this pcr_transport_priority?
        when
            upper(left(pcr_transport_priority, 1)) = 'CHARLIE'
            or upper(left(pcr_transport_priority, 1)) = 'D'
            then 1
        when
            upper(right(pcr_transport_priority, 1)) = '3'
            and lower(pcr_patient_acuity_initial) = 'lower acuity (green)'
            then 2
        when
            upper(left(pcr_transport_priority, 1)) = 'minor injury'
            or upper(left(pcr_transport_priority, 1)) = 'possible injury'
            then 2
        when
            upper(right(pcr_transport_priority, 1)) != '3'
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
add constraint ems__incidents_patient_injry_sev_fk foreign key (
    patient_injry_sev
)
references lookups.injry_sev on update restrict on delete restrict;

comment on column ems__incidents.patient_injry_sev is 'The patient injury severity as mapped to the CRIS injury severity lookup';

-- -- add mode column
-- ALTER TABLE ems__incidents
-- ADD COLUMN mode text GENERATED ALWAYS AS (
-- CASE
--     WHEN LOWER(mvc_form_vehicle_type) = 'motorcycle' THEN 'Motorcycle'
--     WHEN LOWER(mvc_form_vehicle_type) = 'moped' THEN 'Motorcycle'
--     WHEN LOWER(pcr_cause_of_injury) LIKE '%motorcy%' THEN 'Motorcycle'
--     WHEN LOWER(pcr_cause_of_injury) LIKE '%scoot%' OR LOWER(pcr_patient_complaints) LIKE '%scoot%' THEN 'E-Scooter'
--     WHEN LOWER(pcr_cause_of_injury) LIKE '%bike%' OR LOWER(pcr_cause_of_injury) LIKE '%bicy%' OR 
--          LOWER(pcr_patient_complaints) LIKE '%bike%' OR LOWER(pcr_patient_complaints) LIKE '%bicy%' THEN 'Bicycle'
--     WHEN LOWER(pcr_cause_of_injury) LIKE '%pede%' OR LOWER(pcr_patient_complaints) LIKE '%pede%' OR
--          (LOWER(pcr_cause_of_injury) LIKE '%auto%' AND LOWER(pcr_cause_of_injury) LIKE '%ped%') OR
--          (LOWER(pcr_patient_complaints) LIKE '%auto%' AND LOWER(pcr_patient_complaints) LIKE '%ped%') THEN 'Pedestrian'
--     WHEN LOWER(pcr_cause_of_injury) LIKE '%motorcy%' OR LOWER(pcr_patient_complaints) LIKE '%mc %' THEN 'Motorcycle'
--     WHEN LOWER(mvc_form_vehicle_type) = 'motorized scooter' THEN 'E-Scooter'
--     ELSE 'Motor Vehicle'
--     END
-- ) STORED;


-- add some indexes
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
create index ems__incidents_patient_injry_sev_index on ems__incidents (
    patient_injry_sev
);
create index crashes_case_id_index on crashes (case_id);
-- these indexes optimize our ST_Distance operations, which require geography types and are the fastes way to check point-to-point proximity
create index idx_ems_geometry_geography on ems__incidents using gist (
    (geometry::geography)
);
create index idx_crashes_position_geography on crashes using gist (
    (position::geography)
);


-- todo: do we want to ignore already-matched records?
-- todo: does performance improve after more ems records have been matched?
-- todo: don't fire trigger for temp records

-- Create or replace the trigger function for the crashes table
create or replace function update_crash_ems_match()
returns trigger as $$
DECLARE
    matching_ems RECORD;
    ems_record RECORD;
    match_count INTEGER;
    meters_threshold INTEGER := 1000;
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
            -- todo: match already ignored records: is this ok?
            e.crash_pk IS NULL
            AND e.incident_received_datetime  >= (NEW.crash_timestamp - INTERVAL '60 minutes')
            AND e.incident_received_datetime  <= (NEW.crash_timestamp + INTERVAL '60 minutes')
            AND e.geometry IS NOT NULL
            AND NEW.position IS NOT NULL
            AND ST_DWithin(e.geometry::geography, NEW.position::geography, meters_threshold)
    ) LOOP
        -- Find all crashes which match this EMS record location + time
        WITH matching_crashes AS (
            SELECT c.id
            FROM crashes c
            WHERE 
                c.is_deleted = false
                and not c.is_temp_record
                AND matching_ems.incident_received_datetime  >= (c.crash_timestamp - INTERVAL '60 minutes')
                AND matching_ems.incident_received_datetime  <= (c.crash_timestamp + INTERVAL '60 minutes')
                AND c.position IS NOT NULL
                AND ST_DWithin(matching_ems.geometry::geography, c.position::geography, meters_threshold)
        )
        SELECT COUNT(*) INTO match_count FROM matching_crashes;
        
        IF match_count = 1 THEN
            -- this EMS record is only matched to one crash - we can assign the crash_pk
            UPDATE ems__incidents 
            SET crash_pk = NEW.id,
                match_status = 'matched'
            WHERE id = matching_ems.id;
        ELSE
            -- multiple matching crashes found - cannot assign crash_pk
            UPDATE ems__incidents 
            SET match_status = 'multiple',
                crash_pk = NULL
            WHERE id = matching_ems.id;
        END IF;
    END LOOP;

    -- handle previously matched EMS records which may need to be unlinked
    -- todo: are we sure we want to remove matches?
    IF TG_OP = 'UPDATE' THEN
        UPDATE ems__incidents 
        SET crash_pk = NULL,
            match_status = 'unmatched'
        WHERE crash_pk = NEW.id
          AND (
              incident_received_datetime  < (NEW.crash_timestamp - INTERVAL '60 minutes')
              OR incident_received_datetime  > (NEW.crash_timestamp + INTERVAL '60 minutes')
              OR geometry IS NULL
              OR NEW.position IS NULL
              OR (NOT ST_DWithin(geometry::geography, NEW.position::geography, meters_threshold))
          );
    END IF;
    RETURN NEW;
END;
$$ language plpgsql;


-- insert trigger
create or replace trigger crash_insert_ems_match_trigger
after insert on crashes
for each row execute function update_crash_ems_match();

-- update trigger
create or replace trigger crash_update_ems_match_trigger
after update on crashes
for each row when (
    (new.latitude is distinct from old.latitude)
    or (new.longitude is distinct from old.longitude)
    or (new.crash_timestamp is distinct from old.crash_timestamp)
) execute function update_crash_ems_match();

-- testing with all crashes since 2024-01-01
-- 300 meters and interval 60 minutes: 4230 matches with 88 multiple
-- 300 meters and interval 90 minutes: 4300 with 88 multiple
-- 1000 meters and interval 60 minutes: 5056 matches with 125 multiple
-- 1000 meters interval 90 minutes: 5156 and 141 multiple


--
-- drop redundant ems_id column and rebuild people_list_view
--
alter table people drop column ems_id cascade;

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
