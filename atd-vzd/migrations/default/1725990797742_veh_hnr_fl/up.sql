alter table units_cris add column veh_hnr_fl boolean;
alter table units_edits add column veh_hnr_fl boolean;
alter table units add column veh_hnr_fl boolean;

comment on column public.units_cris.veh_hnr_fl is 'If the unit left the scene of the crash, aka, hit-and-run. ';
comment on column public.units_edits.veh_hnr_fl is 'If the unit left the scene of the crash, aka, hit-and-run. ';
comment on column public.units.veh_hnr_fl is 'If the unit left the scene of the crash, aka, hit-and-run. ';

insert into _column_metadata (column_name, record_type, is_imported_from_cris)
values ('veh_hnr_fl', 'units', true);
