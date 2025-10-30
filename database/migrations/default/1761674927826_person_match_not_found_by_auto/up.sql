ALTER TABLE ems__incidents
DROP CONSTRAINT ems__incidents_person_match_status_check;

ALTER TABLE ems__incidents
ADD CONSTRAINT ems__incidents_person_match_status_check CHECK (
    person_match_status IN (
        'unmatched',
        'unmatched_by_manual_qa',
        'matched_by_automation',
        'matched_by_manual_qa',
        'multiple_matches_by_automation',
        'unmatched_by_automation'
    )
);

ALTER TABLE ems__incidents ADD COLUMN person_match_attributes text[];
