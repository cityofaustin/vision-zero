update public.atd_txdot_crashes set surf_type_id = 99
where surf_type_id = 'null';

alter table lookups.unit_desc_lkp
drop constraint unit_desc_owner_check,
add constraint unit_desc_owner_check check (
    (
        (id < 177 and source = 'cris')
        or (id >= 177 and source = 'vz')
        or (id = 94 and source = 'vz')
    )
);

insert into lookups.unit_desc_lkp (id, label, source) values (
    94, 'REPORTED INVALID', 'vz'
);
