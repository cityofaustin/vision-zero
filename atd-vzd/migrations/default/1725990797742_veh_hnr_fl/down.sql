delete from _column_metadata
where
    column_name = 'veh_hnr_fl'
    and record_type = 'units';

alter table units_cris drop column veh_hnr_fl;
alter table units_edits drop column veh_hnr_fl;
alter table units drop column veh_hnr_fl;
