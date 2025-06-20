--
-- add person_match_status column
--
alter table ems__incidents
    add column person_match_status text default 'unmatched'
    check (
        person_match_status in (
            'unmatched',
            'matched_by_automation',
            'matched_by_manual_qa',
            'multiple_matches_by_automation'
        )
    ),
    add column matched_person_ids integer [];

comment on column ems__incidents.person_match_status is 'The status of the CR3 person record match';
comment on column ems__incidents.matched_person_ids is 'The IDs of the CR3 person records that were found to match this record';

--
-- Add person_match_status to this trigger
--
CREATE OR REPLACE FUNCTION public.ems_update_person_crash_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    matching_person_record RECORD;
BEGIN
    IF NEW.person_id is null THEN
        NEW.person_match_status = 'unmatched';  -- <- new line
        return NEW;
    END IF;
    -- Find matching person record
    SELECT id, crash_pk INTO matching_person_record 
    FROM people_list_view 
    WHERE id = NEW.person_id;

    NEW.crash_pk = matching_person_record.crash_pk;
    NEW.crash_match_status = 'matched_by_manual_qa';
    NEW.person_match_status = 'matched_by_manual_qa';  -- <- new line
    return NEW;
END;
$function$;

--
-- Create trigger function to match person record 
--
CREATE OR REPLACE FUNCTION public.ems_person_ems_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    other_matching_ems_id INTEGER;
    matching_person_ids INTEGER[];
BEGIN
    IF NEW.person_match_status = 'matched_by_manual_qa' 
    or NEW.pcr_patient_age is NULL
    or NEW.pcr_patient_gender is NULL
    or NEW.pcr_patient_race is NULL
    THEN
        -- do nothing
        return NEW;
    END IF;

    IF NEW.crash_pk is NULL THEN
        new.person_match_status = 'unmatched';
        new.matched_person_ids = NULL;
        return NEW;
    END IF;

    --
    -- Check to see if there are other EMS patients with the same demographics as NEW
    --
    select id from ems__incidents e where
    e.incident_number = NEW.incident_number
    and e.id !=  NEW.id
    and e.pcr_patient_age = NEW.pcr_patient_age
    and e.pcr_patient_race = NEW.pcr_patient_race
    and e.pcr_patient_gender = NEW.pcr_patient_gender
    limit 1
    into other_matching_ems_id;

    --
    -- Stop if multiple identical PCRs 
    -- todo: we could potentially try to match multiple records to multiple people?
    --
    IF other_matching_ems_id IS NOT NULL THEN
        raise debug 'Multiple EMS patients with same demographic characteristcs found - aborting person match.';
        return NEW;
    END IF;

    --
    -- Query for matching person records
    --
    SELECT
        COALESCE(array_agg(p.id), ARRAY[]::integer[])
    FROM
        people_list_view p
        left join lookups.drvr_ethncty ethncty_lkp on ethncty_lkp.id = p.prsn_ethnicity_id
        left join lookups.gndr gndr_lkp on gndr_lkp.id = p.prsn_gndr_id
    WHERE
        p.crash_pk = NEW.crash_pk
        and p.prsn_age = NEW.pcr_patient_age
        AND gndr_lkp.label ilike NEW.pcr_patient_gender
        AND NEW.pcr_patient_race ilike CONCAT('%', ethncty_lkp.label, '%')
        into matching_person_ids;

    raise debug 'Found % matching people records', array_length(matching_person_ids, 1);

    IF array_length(matching_person_ids, 1) IS NULL THEN
        -- no match
        NEW.person_match_status = 'unmatched';
        NEW.matched_person_ids = NULL;
        NEW.person_id = NULL;
    ELSIF array_length(matching_person_ids, 1) = 1 THEN
        NEW.matched_person_ids = matching_person_ids;
        NEW.person_id = matching_person_ids[1];
        NEW.person_match_status = 'matched_by_automation';
    ELSE
        NEW.matched_person_ids = matching_person_ids;
        NEW.person_match_status = 'multiple_matches_by_automation';
        NEW.person_id = NULL;
    END IF;
    return NEW;
END;
$function$;

drop trigger if exists ems_person_match_trigger on ems__incidents;

create trigger ems_person_match_trigger BEFORE UPDATE ON ems__incidents FOR EACH ROW WHEN 
    (old.crash_pk IS DISTINCT FROM new.crash_pk) EXECUTE FUNCTION ems_person_ems_match();
