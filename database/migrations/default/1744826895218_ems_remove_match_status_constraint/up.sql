
alter table ems__incidents
drop constraint matched_crash_pks_non_null,
add column created_by text not null default 'system',
add column updated_by text not null default 'system';

comment on column ems__incidents.matched_crash_pks is 'The IDs of multiple crashes that were found to match this record. Set via trigger.''';
