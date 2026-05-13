-- Drop the existing constraint
ALTER TABLE ems__incidents 
DROP CONSTRAINT ems__incidents_crash_match_status_check;

-- Add the new constraint with the additional value
ALTER TABLE ems__incidents 
ADD CONSTRAINT ems__incidents_crash_match_status_check 
CHECK (crash_match_status = ANY (ARRAY[
    'unmatched'::text, 
    'matched_by_automation'::text, 
    'multiple_matches_by_automation'::text, 
    'matched_by_manual_qa'::text, 
    'unmatched_by_manual_qa'::text
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
            'unmatched_by_manual_qa'::text
        ]
    )
)

