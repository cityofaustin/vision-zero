-- deleting the units edits layer
drop table if exists public.change_log_units_edits cascade;
drop table if exists public.units_edits cascade;

-- recreating cris unit insert function and removing part about inserting into unit edits row

drop function if exists public.units_cris_insert_rows cascade;

CREATE OR REPLACE FUNCTION public.units_cris_insert_rows()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- insert new combined / official record
    INSERT INTO public.units (
        autonomous_unit_id,
        contrib_factr_1_id,
        contrib_factr_2_id,
        contrib_factr_3_id,
        contrib_factr_p1_id,
        contrib_factr_p2_id,
        crash_pk,
        created_by,
        cris_crash_id,
        e_scooter_id,
        first_harm_evt_inv_id,
        id,
        is_deleted,
        pbcat_pedalcyclist_id,
        pbcat_pedestrian_id,
        pedalcyclist_action_id,
        pedestrian_action_id,
        rpt_autonomous_level_engaged_id,
        unit_desc_id,
        unit_nbr,
        updated_by,
        veh_body_styl_id,
        veh_damage_description1_id,
        veh_damage_description2_id,
        veh_damage_direction_of_force1_id,
        veh_damage_direction_of_force2_id,
        veh_damage_severity1_id,
        veh_damage_severity2_id,
        veh_hnr_fl,
        veh_make_id,
        veh_mod_id,
        veh_mod_year,
        veh_trvl_dir_id,
        vin
    ) values (
        new.autonomous_unit_id,
        new.contrib_factr_1_id,
        new.contrib_factr_2_id,
        new.contrib_factr_3_id,
        new.contrib_factr_p1_id,
        new.contrib_factr_p2_id,
        new.crash_pk,
        new.created_by,
        new.cris_crash_id,
        new.e_scooter_id,
        new.first_harm_evt_inv_id,
        new.id,
        new.is_deleted,
        new.pbcat_pedalcyclist_id,
        new.pbcat_pedestrian_id,
        new.pedalcyclist_action_id,
        new.pedestrian_action_id,
        new.rpt_autonomous_level_engaged_id,
        new.unit_desc_id,
        new.unit_nbr,
        new.updated_by,
        new.veh_body_styl_id,
        new.veh_damage_description1_id,
        new.veh_damage_description2_id,
        new.veh_damage_direction_of_force1_id,
        new.veh_damage_direction_of_force2_id,
        new.veh_damage_severity1_id,
        new.veh_damage_severity2_id,
        new.veh_hnr_fl,
        new.veh_make_id,
        new.veh_mod_id,
        new.veh_mod_year,
        new.veh_trvl_dir_id,
        new.vin
    );

    RETURN NULL;
END;
$function$
;

create or replace trigger insert_new_units_cris after
insert
on
public.units_cris for each row execute function units_cris_insert_rows();

-- recreating the units_cris_update function to use just the units unified layer
-- to check if VZ has edited a value and remove the units_edits part
drop function if exists public.units_cris_update cascade;

--
-- handle a cris units update by updating the
-- unified units record from cris + edit values
--
CREATE OR REPLACE FUNCTION public.units_cris_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    new_cris_jb jsonb := to_jsonb (new);
    old_cris_jb jsonb := to_jsonb (old);
    unified_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update public.units set ';
begin
    -- get corresponding the VZ record as jsonb
    SELECT to_jsonb(units) INTO unified_record_jb from public.units where public.units.id = new.id;

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
            || format(' where public.units.id = %s', new.id);
        raise debug 'Updating units record from CRIS update';
        execute (update_stmt) using new;
    else
        raise debug 'No changes to unified record needed';
    end if;
    return null;
end;
$function$
;

create or replace trigger update_units_from_units_cris_update after
update
on
public.units_cris for each row execute function units_cris_update();
