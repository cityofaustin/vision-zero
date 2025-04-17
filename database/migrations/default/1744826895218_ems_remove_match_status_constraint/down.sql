alter table ems__incidents
drop column created_by,
drop column updated_by,
add constraint matched_crash_pks_non_null check (
    (crash_match_status = 'multiple_matches_by_automation')
    or (matched_crash_pks is NULL)
);
comment on column ems__incidents.matched_crash_pks is 'The IDs of multiple crashes that were found to match this record. Can only be populated when crash_match_status is ''multiple_matches_by_automation''';
