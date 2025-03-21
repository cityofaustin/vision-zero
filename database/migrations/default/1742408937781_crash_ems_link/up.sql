
-- rename fk column to crash_pk and add fk constraint
alter table ems__incidents drop column crash_id to crash_pk;

alter table  ems__incidents 
    add constraint ems__incidents_crashes_crash_pk_fkey foreign key (crash_pk)
    references public.crashes(id) on update cascade on delete set null;

alter table ems__incidents add column match_status text;

-- add some indexes
create index ems__incidents_crashes_crash_pk_index on public.ems__incidents (crash_pk);
create index ems__incidents_crashes_incident_received_datetime_index 
    on public.ems__incidents (incident_received_datetime);
create index ems__incidents_apd_incident_numbers_index on ems__incidents using gin (apd_incident_numbers);
create index ems__incidents_geometry_index on ems__incidents using gist (geometry);
create index crashes_case_id_index on crashes (case_id);

-- -- First, let's ensure we have the match_status column in ems__incidents
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
--                   WHERE table_name = 'ems__incidents' AND column_name = 'match_status') THEN
--         ALTER TABLE ems__incidents ADD COLUMN match_status TEXT;
--     END IF;
    
--     IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
--                   WHERE table_name = 'ems__incidents' AND column_name = 'crash_pk') THEN
--         ALTER TABLE ems__incidents ADD COLUMN crash_pk INTEGER;
--     END IF;
-- END$$;

-- Create or replace the trigger function for the crashes table
CREATE OR REPLACE FUNCTION update_crash_ems_match()
RETURNS TRIGGER AS $$
DECLARE
    matching_ems RECORD;
    ems_record RECORD;
    match_count INTEGER;
    meters_threshold INTEGER := 100; -- 100 meters threshold
    hours_threshold FLOAT := 1.0;    -- 1 hour threshold
BEGIN
    -- When a crash is inserted or updated, find all EMS records that match it
    -- todo: do we need to check if case_id has changed to null?
    -- todo: do we ignore if responding agency not APD?

    -- First, find all EMS records where this crash's case_id is in the apd_incident_numbers array
    FOR matching_ems IN (
        SELECT 
            id
        FROM 
            ems__incidents
        WHERE 
            NEW.case_id IS NOT NULL
            AND apd_incident_numbers IS NOT NULL
            -- todo: this ignores records that are already matched - ok?
            AND crash_pk IS NOT NULL
            AND NEW.case_id = ANY(apd_incident_numbers)
            AND ABS(EXTRACT(EPOCH FROM (incident_received_datetime - NEW.crash_timestamp))) <= hours_threshold * 3600
            AND geometry IS NOT NULL
            AND NEW.position IS NOT NULL
            AND ST_DistanceSphere(geometry, NEW.position) <= meters_threshold
    ) LOOP
        -- For each matching EMS record, check if it's the only match
        SELECT COUNT(*) INTO match_count
        FROM crashes c
        WHERE c.case_id = ANY((SELECT apd_incident_numbers FROM ems__incidents WHERE id = matching_ems.id))
          AND ABS(EXTRACT(EPOCH FROM ((SELECT incident_received_datetime FROM ems__incidents WHERE id = matching_ems.id) - c.crash_timestamp))) <= hours_threshold * 3600
          AND (SELECT geometry FROM ems__incidents WHERE id = matching_ems.id) IS NOT NULL
          AND c.position IS NOT NULL
          AND ST_DistanceSphere((SELECT geometry FROM ems__incidents WHERE id = matching_ems.id), c.position) <= meters_threshold;
          
        -- Update the EMS record based on match count
        IF match_count = 1 THEN
            UPDATE ems__incidents 
            SET crash_pk = NEW.id,
                match_status = 'matched'
            WHERE id = matching_ems.id;
        ELSE
            UPDATE ems__incidents 
            SET match_status = 'multiple',
                crash_pk = NULL
            WHERE id = matching_ems.id;
        END IF;
    END LOOP;
    
    -- When a crash is updated, also handle any EMS records that were previously matched to this crash
    -- but might no longer match after the update
    IF TG_OP = 'UPDATE' THEN
        FOR ems_record IN (
            SELECT id 
            FROM ems__incidents 
            WHERE crash_pk = NEW.id
        ) LOOP
            -- Check if the EMS record still matches with this crash
            IF NOT EXISTS (
                SELECT 1
                FROM ems__incidents e
                WHERE e.id = ems_record.id
                  AND NEW.case_id = ANY(e.apd_incident_numbers)
                  AND ABS(EXTRACT(EPOCH FROM (e.incident_received_datetime - NEW.crash_timestamp))) <= hours_threshold * 3600
                  AND e.geometry IS NOT NULL
                  AND NEW.position IS NOT NULL
                  AND ST_DistanceSphere(e.geometry, NEW.position) <= meters_threshold
            ) THEN
                -- If it no longer matches, reset the match
                UPDATE ems__incidents 
                SET crash_pk = NULL,
                    match_status = 'unmatched'
                WHERE id = ems_record.id;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for both INSERT and UPDATE operations on crashes
DROP TRIGGER IF EXISTS crash_ems_match_trigger ON crashes;
CREATE TRIGGER crash_ems_match_trigger
AFTER INSERT OR UPDATE ON crashes
FOR EACH ROW EXECUTE FUNCTION update_crash_ems_match();

-- Create a function to manually update all EMS matches for existing crashes
CREATE OR REPLACE FUNCTION update_all_crash_ems_matches()
RETURNS void AS $$
BEGIN
    UPDATE crashes SET id = id;  -- This will trigger the update for all rows
    RAISE NOTICE 'Updated all crash-EMS matches';
END;
$$ LANGUAGE plpgsql;
