-- decruft the apd_incident_numbers column
update ems__incidents set apd_incident_numbers = null
where apd_incident_numbers = '{}';

-- Add 'unmatched_by_automation' to crash and non-cr3 match statuses
alter table ems__incidents
drop constraint ems__incidents_crash_match_status_check;

-- Add the new constraint with the additional value
alter table ems__incidents
add constraint ems__incidents_crash_match_status_check
check (crash_match_status = ANY(array[
    'unmatched'::text,
    'matched_by_automation'::text,
    'multiple_matches_by_automation'::text,
    'matched_by_manual_qa'::text,
    'unmatched_by_manual_qa'::text,
    'unmatched_by_automation'::text
]));


alter table ems__incidents
drop constraint ems__incidents_non_cr3_match_status_check;

alter table ems__incidents
add constraint ems__incidents_non_cr3_match_status_check
check (
    non_cr3_match_status
    = ANY(
        array[
            'unmatched'::text,
            'matched_by_automation'::text,
            'multiple_matches_by_automation'::text,
            'matched_by_manual_qa'::text,
            'unmatched_by_manual_qa'::text,
            'unmatched_by_automation'::text
        ]
    )
)
