ALTER TABLE ems__incidents DROP COLUMN person_match_attributes;

ALTER TABLE ems__incidents
DROP CONSTRAINT ems__incidents_person_match_status_check;

ALTER TABLE ems__incidents
ADD CONSTRAINT ems__incidents_person_match_status_check CHECK (
    person_match_status IN (
        'unmatched',
        'unmatched_by_manual_qa',
        'matched_by_automation',
        'matched_by_manual_qa',
        'multiple_matches_by_automation'
    )
);
