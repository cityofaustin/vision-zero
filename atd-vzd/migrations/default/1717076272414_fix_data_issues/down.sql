-- Reverse the update on public.atd_txdot_crashes
update public.atd_txdot_crashes set surf_type_id = 'null'
where surf_type_id = 99;

-- Reverse the constraint changes on lookups.unit_desc_lkp
alter table lookups.unit_desc_lkp
drop constraint unit_desc_owner_check,
add constraint unit_desc_owner_check check (
    (
        (id < 177 and source = 'cris')
        or (id >= 177 and source = 'vz')
    )
);

-- Reverse the constraint changes on lookups.injry_sev_lkp
alter table lookups.injry_sev_lkp
drop constraint injry_sev_owner_check,
add constraint injry_sev_owner_check check (
    (
        (id < 99 and source = 'cris')
        or (id >= 99 and source = 'vz')
    )
);

-- Delete the inserted records from lookups.unit_desc_lkp and 
-- lookups.injry_sev_lkp
delete from lookups.unit_desc_lkp where id = 94 and source = 'vz';
delete from lookups.injry_sev_lkp where id = 94 and source = 'vz';
