-- rename fk column to crash_pk and add fk constraint
alter table ems__incidents rename column crash_id to crash_pk;

alter table  ems__incidents 
    add constraint ems__incidents_crashes_crash_pk_fkey foreign key (crash_pk)
    references public.crashes(id) on update cascade on delete set null;

-- add generated array of stringified case IDs bc crash case IDs are strings :/
alter table ems__incidents add column apd_case_ids text[] generated always as (
    apd_incident_numbers::text[]
) stored;

-- add column to track match metadata
alter table ems__incidents add column match_status text default 'unmatched';

-- add some indexes
create index ems__incidents_crashes_crash_pk_index on public.ems__incidents (crash_pk);
create index ems__incidents_crashes_incident_received_datetime_index 
    on public.ems__incidents (incident_received_datetime);
create index ems__incidents_apd_incident_numbers_index on ems__incidents using gin (apd_incident_numbers);
create index ems__incidents_apd_case_ids_index on ems__incidents using gin (apd_case_ids);
create index ems__incidents_geometry_index on ems__incidents using gist (geometry);
create index crashes_case_id_index on crashes (case_id);


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

    -- First, find all EMS records where this crash's case_id is in the apd_case_ids array
    FOR matching_ems IN (
        SELECT 
            id
        FROM 
            ems__incidents
        WHERE 
            NEW.case_id IS NOT NULL
            AND apd_case_ids IS NOT NULL
            -- todo: this ignores records that are already matched - ok?
            AND crash_pk IS NULL
            AND NEW.case_id = ANY(apd_case_ids)
            AND ABS(EXTRACT(EPOCH FROM (incident_received_datetime - NEW.crash_timestamp))) <= hours_threshold * 3600
            AND geometry IS NOT NULL
            AND NEW.position IS NOT NULL
            AND ST_DistanceSphere(geometry, NEW.position) <= meters_threshold
    ) LOOP
        SELECT COUNT(*) INTO match_count
        FROM crashes c
        WHERE (SELECT apd_case_ids FROM ems__incidents WHERE id = matching_ems.id) @> ARRAY[c.case_id]
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
                  AND NEW.case_id = ANY(e.apd_case_ids)
                  AND ABS(EXTRACT(EPOCH FROM (e.incident_received_datetime - NEW.crash_timestamp))) <= hours_threshold * 3600
                  AND e.geometry IS NOT NULL
                  AND NEW.position IS NOT NULL
                  AND ST_DistanceSphere(e.geometry, NEW.position) <= meters_threshold
            ) THEN
                -- If it no longer matches, reset the match
                UPDATE ems__incidents 
                SET crash_pk = NULL,
                    match_status = 'match_removed'
                WHERE id = ems_record.id;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for both INSERT and UPDATE operations on crashes
CREATE OR REPLACE TRIGGER crash_ems_match_trigger
AFTER INSERT OR UPDATE ON crashes
FOR EACH ROW EXECUTE FUNCTION update_crash_ems_match();

-- Create a function to manually update all EMS matches for existing crashes
-- CREATE OR REPLACE FUNCTION update_all_crash_ems_matches()
-- RETURNS void AS $$
-- BEGIN
--     UPDATE crashes SET id = id;  -- This will trigger the update for all rows
--     RAISE NOTICE 'Updated all crash-EMS matches';
-- END;
-- $$ LANGUAGE plpgsql;


-- testing
crash case_id = 192341914;
EMS_ID = 14637;
cris_crash_id = 17358928;
crash_pk = 119213;
ems lat: 30.448879;
ems lon: -97.762925;
crash lat: 30.44895221
crash lon: -97.76282324
crash crash_timestamp: 2019-08-23 02:19:00+00
ems_timestamp: 2019-08-23 02:25:35+00
update crashes set active_school_zone_fl = true where cris_crash_id = 17358928;




SELECT 
            id
        FROM 
            ems__incidents
        WHERE 
            apd_case_ids IS NOT NULL
            AND crash_pk IS NULL
            AND '192341914' = ANY(apd_case_ids)
            AND ABS(EXTRACT(EPOCH FROM (incident_received_datetime - '2019-08-23 02:19:00+00'::timestamptz))) <= 1 * 3600
            AND geometry IS NOT NULL
            AND ST_DistanceSphere(geometry, ST_SetSRID(ST_MakePoint(-97.76282324, 30.44895221), 4326)) <= 100;