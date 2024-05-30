update public.atd_txdot_crashes set surf_type_id = 99
where surf_type_id = 'null';

insert into lookup.unit_desc_lkp (id, label, source) values (
    94, 'REPORTED INVALID', 'vz'
);
