alter table units_cris add column veh_hnr_fl boolean;
alter table units_edits add column veh_hnr_fl boolean;
alter table units add column veh_hnr_fl boolean;

insert into _column_metadata (column_name, record_type, is_imported_from_cris)
values ('veh_hnr_fl', 'units', true);
