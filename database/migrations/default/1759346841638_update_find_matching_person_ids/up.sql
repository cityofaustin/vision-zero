--- This migration updates the first query to not include soft-deleted records

CREATE OR REPLACE FUNCTION public.find_matching_person_ids(ems_record ems__incidents)
 RETURNS integer[]
 LANGUAGE plpgsql
AS $function$
DECLARE
    matching_person_ids INTEGER[];
    other_matching_ems_id INTEGER;
BEGIN
    raise debug '**function: find_matching_person_ids**';
    --
    -- only query for matches when crash_pk is not null, ie the EMS record is already matched to a crash
    --
    if ems_record.crash_pk is null then
        return null;
    end if;
    --
    -- Check to see if there are other EMS patients with the same demographics
    -- todo: index these columns?
    --
    select id from ems__incidents e where
    e.incident_number = ems_record.incident_number
    and e.is_deleted is false --- makes sure that deleted records wont prevent non-deleted records from being matched
    and e.id !=  ems_record.id
    and e.pcr_patient_age = ems_record.pcr_patient_age
    and e.pcr_patient_race = ems_record.pcr_patient_race
    and e.pcr_patient_gender = ems_record.pcr_patient_gender
    limit 1
    into other_matching_ems_id;
    --
    -- Do not proceed if multiple identical PCRs 
    --
    IF other_matching_ems_id IS NOT NULL THEN
        raise debug 'Multiple EMS patients with same demographic characteristcs found - aborting person match.';
        return NULL;
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
        p.crash_pk = ems_record.crash_pk
        and p.prsn_age = ems_record.pcr_patient_age
        AND gndr_lkp.label ilike ems_record.pcr_patient_gender
        --
        -- ethnicity can be matched with a case-insensitive wildcard
        -- except for `American Indian or Alaska Native` which maps
        -- to the CRIS label `AMER. INDIAN/ALASKAN NATIVE`
        --
        AND (
            ems_record.pcr_patient_race ilike CONCAT('%', ethncty_lkp.label, '%')
            OR (
                ethncty_lkp.label ilike '%indian%' 
                AND ems_record.pcr_patient_race ilike '%indian%'
            )
        )
        into matching_person_ids;

    raise debug 'Found % matching people records', array_length(matching_person_ids, 1);
    return NULLIF(matching_person_ids, '{}');
END;
$function$
;
