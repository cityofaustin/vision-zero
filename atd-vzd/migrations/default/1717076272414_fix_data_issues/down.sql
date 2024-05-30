update public.atd_txdot_crashes set surf_type_id = 'null'
where surf_type_id = 99;

delete from lookup.unit_desc_lkp
where id = 94 and label = 'REPORTED INVALID' and source = 'vz';
