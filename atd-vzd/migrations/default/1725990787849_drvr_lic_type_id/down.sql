delete from _column_metadata
where
    column_name = 'drvr_lic_type_id'
    and record_type = 'people';

-- restore to version 1715960011005_cris_insert_triggers
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

alter table public.people_cris drop column drvr_lic_type_id;
alter table public.people_edits drop column drvr_lic_type_id;
alter table public.people drop column drvr_lic_type_id;
drop table lookups.drvr_lic_type;
