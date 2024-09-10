create table lookups.drvr_lic_type (
    id integer primary key,
    label text not null unique,
    source text not null default 'cris'
);

insert into lookups.drvr_lic_type (id, label) values
(1, 'ID CARD'),
(4, 'COMMERCIAL DRIVER LIC.'),
(8, 'UNLICENSED'),
(9, 'DRIVER LICENSE'),
(10, 'OCCUPATIONAL'),
(95, 'AUTONOMOUS'),
(98, 'OTHER'),
(99, 'UNKNOWN');

comment on table lookups.drvr_lic_type is 'Lookup table for driver''s license types';

alter table public.people_cris
add column drvr_lic_type_id integer,
add constraint people_cris_drvr_lic_type_id_fkey
foreign key (drvr_lic_type_id)
references lookups.drvr_lic_type (id);

alter table public.people_edits
add column drvr_lic_type_id integer,
add constraint people_edits_drvr_lic_type_id_fkey
foreign key (drvr_lic_type_id)
references lookups.drvr_lic_type (id);

alter table public.people
add column drvr_lic_type_id integer,
add constraint people_drvr_lic_type_id_fkey
foreign key (drvr_lic_type_id)
references lookups.drvr_lic_type (id);

comment on column public.people_cris.drvr_lic_type_id is 'Driver''s license type';
comment on column public.people_edits.drvr_lic_type_id is 'Driver''s license type';
comment on column public.people.drvr_lic_type_id is 'Driver''s license type';

insert into _column_metadata (column_name, record_type, is_imported_from_cris)
values ('drvr_lic_type_id', 'people', true);
