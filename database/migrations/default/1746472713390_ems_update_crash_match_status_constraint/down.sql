alter table ems__incidents
drop constraint ems__incidents_crash_match_status_check;

alter table ems__incidents
add constraint ems__incidents_crash_match_status_check check (crash_match_status in (
        'unmatched',
        'matched_by_automation',
        'multiple_matches_by_automation',
        'matched_by_manual_qa',
    )
    );
