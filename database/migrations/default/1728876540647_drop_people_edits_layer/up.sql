-- deleting the people edits layer
drop table if exists public.change_log_people_edits cascade;
drop table if exists public.people_edits cascade;

-- recreating cris people insert function and removing part about inserting into people edits row

drop function if exists public.people_cris_insert_rows cascade;

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

    RETURN NULL;
END;
$function$
;

create or replace trigger insert_new_people_cris after
insert
    on
    public.people_cris for each row execute function people_cris_insert_rows();

-- recreating the people_cris_update function to use just the people unified layer
-- to check if VZ has edited a value and remove the people_edits part
drop function if exists public.people_cris_update cascade;

--
-- handle a cris people update by updating the
-- unified people record from cris + edit values
--
CREATE OR REPLACE FUNCTION public.people_cris_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    new_cris_jb jsonb := to_jsonb (new);
    old_cris_jb jsonb := to_jsonb (old);
    unified_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update public.people set ';
begin
    -- get corresponding the VZ record as jsonb
    SELECT to_jsonb(people) INTO unified_record_jb from public.people where public.people.id = new.id;

    -- for every key in the cris json object
    for column_name in select jsonb_object_keys(new_cris_jb) loop
        -- ignore audit fields
        continue when column_name in ('created_at', 'updated_at', 'created_by', 'updated_by');
        -- if the new value doesn't match the old
        if(new_cris_jb -> column_name <> old_cris_jb -> column_name) then
            -- see if the unified record has the same value as the old cris value
            if (unified_record_jb -> column_name = old_cris_jb -> column_name) then
                -- this value is not overridden by VZ
                -- so update the unified record with this new value
                updates_todo := updates_todo || format('%I = $1.%I', column_name, column_name);
            end if;
        end if;
    end loop;
    if(array_length(updates_todo, 1) > 0) then
        -- set audit field updated_by to match cris record
        updates_todo := updates_todo || format('%I = $1.%I', 'updated_by', 'updated_by');
        -- complete the update statement by joining all `set` clauses together
        update_stmt := update_stmt
            || array_to_string(updates_todo, ',')
            || format(' where public.people.id = %s', new.id);
        raise debug 'Updating people record from CRIS update';
        execute (update_stmt) using new;
    else
        raise debug 'No changes to unified record needed';
    end if;
    return null;
end;
$function$
;


create or replace trigger update_people_from_people_cris_update after
update
    on
    public.people_cris for each row execute function people_cris_update();
