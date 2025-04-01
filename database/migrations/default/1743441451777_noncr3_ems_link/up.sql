--
-- add fk column to atd_apd_blueform.case_id
--
alter table ems__incidents add column atd_apd_blueform_case_id integer;
alter table ems__incidents
add constraint ems__incidents_atd_apd_blueform_case_id_fkey foreign key (
    atd_apd_blueform_case_id
)
references public.atd_apd_blueform (
    case_id
) on update cascade on delete set null;

comment on column ems__incidents.atd_apd_blueform_case_id is 'The non-CR3 case ID matched to this record';

--
-- add a timestamptz column and set it based on date and hour columns
--
alter table atd_apd_blueform add column case_timestamp timestamptz;
update atd_apd_blueform set
    case_timestamp = (date::text || ' ' || lpad(hour::text, 2, '0') || ':00:00')::timestamp at time zone 'America/Chicago';


--
-- add soft delete column
--
alter table atd_apd_blueform add is_deleted boolean not null default false;

comment on column atd_apd_blueform.case_timestamp is 'The timestamp at which the APD case occurred, precise only to the hour :(';
comment on column atd_apd_blueform.date is 'The local (America/Chicago) calendar date the case occurred';
comment on column atd_apd_blueform.hour is 'The local (America/Chicago) hour at which the case occurred, 0-24';
comment on column atd_apd_blueform.is_deleted is 'Indicates soft-deletion';

--
-- trigger function to assign timestamptz from local date fields
-- we can't use a generated function bc time zones are considered to be mutable
--
create or replace function update_atd_apd_blueform_case_timestamp()
returns trigger as $$
BEGIN
    NEW.case_timestamp = (NEW.date::text || ' ' || 
        LPAD(NEW.hour::text, 2, '0') || ':00:00')::timestamp AT TIME ZONE 'America/Chicago';
    RETURN NEW;
END;
$$ language plpgsql;


create or replace trigger insert_atd_apd_blueform_case_timestamp_trigger
before insert on atd_apd_blueform
for each row
execute function update_atd_apd_blueform_case_timestamp();

create or replace trigger update_atd_apd_blueform_case_timestamp_trigger
before update on atd_apd_blueform
for each row when (
    (new.hour is distinct from old.hour)
    or (new.date is distinct from old.date)
)
execute function update_atd_apd_blueform_case_timestamp();


--
-- index the new columns
--
create index ems__incidents_atd_apd_blueform_case_id_index on public.ems__incidents (
    atd_apd_blueform_case_id
);

create index atd_apd_blueform_case_timestamp_index on public.atd_apd_blueform (
    case_timestamp
);

create index atd_apd_blueform_is_deleted_index on public.atd_apd_blueform (
    is_deleted
);


--
-- Trigger which soft-deletes atd_apd_blueform records if there is a cr3 crash
-- with the same case_id
--
create or replace function remove_dupe_non_cr3s()
returns trigger as $$
DECLARE
    text_case_id text;
BEGIN
    text_case_id := NEW.case_id::text;
    if exists (select 1 from crashes where case_id = text_case_id) then
        new.is_deleted = true;
    end if;
    return new;
END;
$$ language plpgsql;

create trigger remove_dupe_non_cr3s_insert_trigger
before insert or update on atd_apd_blueform
for each row execute function remove_dupe_non_cr3s();



--
--
--  HAVE NOT UPDATED THIS FUNCTION!!!!!
--
--

--
-- Function which matches ems records to non-cr3 crashes
--
create or replace function update_atd_apd_blueform_ems_match()
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