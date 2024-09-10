delete from _column_metadata
where
    column_name = 'drvr_lic_type_id'
    and record_type = 'people';

alter table public.people_cris drop column drvr_lic_type_id;
alter table public.people_edits drop column drvr_lic_type_id;
alter table public.people drop column drvr_lic_type_id;
drop table lookups.drvr_lic_type;
