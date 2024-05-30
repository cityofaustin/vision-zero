update public.atd_txdot_crashes set surf_type_id = 'null'
where surf_type_id = 99;

delete from lookups.unit_desc_lkp
where id = 94 and label = 'REPORTED INVALID' and source = 'vz';

alter table lookups.unit_desc_lkp
drop constraint unit_desc_owner_check,
add constraint unit_desc_owner_check check (
    (
        (id < 177 and source = 'cris')
        or (id >= 177 and source = 'vz')
    )
);
