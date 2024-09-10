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

CREATE OR REPLACE FUNCTION public.people_cris_insert_rows()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- insert new combined / official record
    INSERT INTO public.people (
        created_by,
        drvr_city_name,
        drvr_drg_cat_1_id,
        drvr_lic_type_id,
        drvr_zip,
        id,
        is_deleted,
        is_primary_person,
        prsn_age,
        prsn_alc_rslt_id,
        prsn_alc_spec_type_id,
        prsn_bac_test_rslt,
        prsn_death_timestamp,
        prsn_drg_rslt_id,
        prsn_drg_spec_type_id,
        prsn_ethnicity_id,
        prsn_exp_homelessness,
        prsn_first_name,
        prsn_gndr_id,
        prsn_helmet_id,
        prsn_injry_sev_id,
        prsn_last_name,
        prsn_mid_name,
        prsn_name_sfx,
        prsn_nbr,
        prsn_occpnt_pos_id,
        prsn_rest_id,
        prsn_taken_by,
        prsn_taken_to,
        prsn_type_id,
        unit_id,
        updated_by
    ) values (
        new.created_by,
        new.drvr_city_name,
        new.drvr_drg_cat_1_id,
        new.drvr_lic_type_id,
        new.drvr_zip,
        new.id,
        new.is_deleted,
        new.is_primary_person,
        new.prsn_age,
        new.prsn_alc_rslt_id,
        new.prsn_alc_spec_type_id,
        new.prsn_bac_test_rslt,
        new.prsn_death_timestamp,
        new.prsn_drg_rslt_id,
        new.prsn_drg_spec_type_id,
        new.prsn_ethnicity_id,
        new.prsn_exp_homelessness,
        new.prsn_first_name,
        new.prsn_gndr_id,
        new.prsn_helmet_id,
        new.prsn_injry_sev_id,
        new.prsn_last_name,
        new.prsn_mid_name,
        new.prsn_name_sfx,
        new.prsn_nbr,
        new.prsn_occpnt_pos_id,
        new.prsn_rest_id,
        new.prsn_taken_by,
        new.prsn_taken_to,
        new.prsn_type_id,
        new.unit_id,
        new.updated_by
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO public.people_edits (id) values (new.id);

    RETURN NULL;
END;
$function$;

