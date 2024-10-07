-- recreating the crashes_cris_update function to use just the crashes unified layer
-- to check if VZ has edited a value and remove the crashes_edits part
drop trigger if exists update_crashes_from_crashes_cris_update on public.crashes_cris;

drop function if exists public.crashes_cris_update;

--
-- handle a cris crashes update by updating the
-- unified crashes record from cris + edit values
--
create or replace function public.crashes_cris_update()
returns trigger
language plpgsql
as $$
declare
    new_cris_jb jsonb := to_jsonb (new);
    old_cris_jb jsonb := to_jsonb (old);
    unified_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update public.crashes set ';
begin
    -- get corresponding the VZ record as jsonb
    SELECT to_jsonb(crashes) INTO unified_record_jb from public.crashes where public.crashes.id = new.id;

    -- for every key in the cris json object
    for column_name in select jsonb_object_keys(new_cris_jb) loop
        -- ignore audit fields
        continue when column_name in ('created_at', 'updated_at', 'created_by', 'updated_by');
        -- if the new cris value doesn't match the old cris value
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
            || format(' where public.crashes.id = %s', new.id);
        raise debug 'Updating crashes record from CRIS update';
        execute (update_stmt) using new;
    else
        raise debug 'No changes to unified record needed';
    end if;
    return null;
end;
$$;

create trigger update_crashes_from_crashes_cris_update
after update on public.crashes_cris for each row
execute procedure public.crashes_cris_update();
