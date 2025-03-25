-- todo: modify AFD/EMS ETL to do nothing on conflict?

-- rename fk column to crash_pk and add fk constraint
alter table ems__incidents rename column crash_id to crash_pk;
alter table  ems__incidents 
    add constraint ems__incidents_crashes_crash_pk_fkey foreign key (crash_pk)
    references public.crashes(id) on update cascade on delete set null;

comment on column ems__incidents.crash_pk is 'Crash ID matched to this record';

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
ALTER TABLE ems__incidents
ADD COLUMN patient_injry_sev integer GENERATED ALWAYS AS (
    CASE
        WHEN lower(pcr_provider_impression_primary) = 'death on scene' THEN 4
        WHEN pcr_outcome = 'DECEASED ON SCENE' THEN 4
        WHEN pcr_patient_acuity_final = 'DEAD WITHOUT RESUSCITATION EFFORTS (BLACK)' THEN 4
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) = '3' AND LOWER(pcr_patient_acuity_final) = 'lower acuity (green)' THEN 2
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) = '3' AND LOWER(pcr_patient_acuity_final) = 'critical (red)' THEN 1
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) = '3' AND LOWER(pcr_patient_acuity_final) = 'emergent (yellow)' THEN 1
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) = '3' AND LOWER(pcr_patient_acuity_initial) = 'critical (red)' THEN 1
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) = '3' AND LOWER(pcr_patient_acuity_initial) = 'emergent (yellow)' THEN 1
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) = '3' AND LOWER(pcr_patient_acuity_level) = 'high acuity' THEN 1
        -- what is this pcr_transport_priority?
        WHEN UPPER(LEFT(pcr_transport_priority, 1)) = 'CHARLIE' OR UPPER(LEFT(pcr_transport_priority, 1)) = 'D' THEN 1
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) = '3' AND LOWER(pcr_patient_acuity_initial) = 'lower acuity (green)' THEN 2
        WHEN UPPER(LEFT(pcr_transport_priority, 1)) = 'minor injury' OR UPPER(LEFT(pcr_transport_priority, 1)) = 'possible injury' THEN 2
        WHEN UPPER(RIGHT(pcr_transport_priority, 1)) <> '3' AND LOWER(pcr_patient_acuity_initial) = 'lower acuity (green)' THEN 3
        WHEN UPPER(RIGHT(pcr_outcome, 7)) = 'REFUSED' AND LEFT(LOWER(pcr_patient_acuity_level), 10) = 'low acuity' THEN 3
        ELSE 5
    END
) STORED;

alter table  ems__incidents 
    add constraint ems__incidents_patient_injry_sev_fk foreign key (patient_injry_sev)
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
create index ems__incidents_crashes_crash_pk_index on public.ems__incidents (crash_pk);
create index ems__incidents_crashes_incident_received_datetime_index 
    on public.ems__incidents (incident_received_datetime);
create index ems__incidents_apd_incident_numbers_index on ems__incidents using gin (apd_incident_numbers);
create index ems__incidents_geometry_index on ems__incidents using gist (geometry);
create index ems__incidents_patient_injry_sev_index on ems__incidents (patient_injry_sev);
create index crashes_case_id_index on crashes (case_id);
-- these indexes optimize our ST_Distance operations, which require geography types and are the fastes way to check point-to-point proximity
CREATE INDEX idx_ems_geometry_geography ON ems__incidents USING GIST((geometry::geography));
CREATE INDEX idx_crashes_position_geography ON crashes USING GIST((position::geography));


-- todo: do we want to ignore already-matched records?
-- todo: does performance improve after more ems records have been matched?
-- todo: don't fire trigger for temp records

-- Create or replace the trigger function for the crashes table
CREATE OR REPLACE FUNCTION update_crash_ems_match()
RETURNS TRIGGER AS $$
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

    -- When a crash is updated, handle previously matched EMS records more efficiently
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
              OR ST_Distance(geometry::geography, NEW.position::geography) > meters_threshold
          );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- INSERT trigger
CREATE OR REPLACE TRIGGER crash_insert_ems_match_trigger
AFTER INSERT ON crashes
FOR EACH ROW EXECUTE FUNCTION update_crash_ems_match();

-- UPDATE trigger
CREATE OR REPLACE TRIGGER crash_update_ems_match_trigger
AFTER UPDATE ON crashes
FOR EACH ROW WHEN ((new.latitude IS DISTINCT FROM old.latitude) OR (new.longitude IS DISTINCT FROM old.longitude) OR (new.crash_timestamp IS DISTINCT FROM old.crash_timestamp)) EXECUTE FUNCTION update_crash_ems_match();

-- testing with all crashes since 2024-01-01
-- 300 meters and interval 60 minutes: 4230 matches with 88 multiple
-- 300 meters and interval 90 minutes: 4300 with 88 multiple
-- 1000 meters and interval 60 minutes: 5056 matches with 125 multiple
-- 1000 meters interval 90 minutes: 5156 and 141 multiple
