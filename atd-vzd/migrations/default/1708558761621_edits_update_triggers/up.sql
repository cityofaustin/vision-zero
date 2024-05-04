--
-- handle an crashes_edits update by updating the
-- unified crashes record from cris + edit values
--
create or replace function db.crashes_edits_update()
returns trigger
language plpgsql
as $$
declare
    new_edits_jb jsonb := to_jsonb (new);
    cris_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update db.crashes_unified set ';
begin
    -- get corresponding the cris record as jsonb
    SELECT to_jsonb(crashes_cris) INTO cris_record_jb from db.crashes_cris where db.crashes_cris.crash_id = new.crash_id;
    -- for every key in the vz json object
    for column_name in select jsonb_object_keys(new_edits_jb) loop
        -- ignore audit fields, except updated_by
        continue when column_name in ('created_at', 'updated_at', 'created_by');
        --  create a set statement for the column
        if cris_record_jb ? column_name then
            -- if this column exists on the cris table, coalesce vz + cris values
            updates_todo := updates_todo
            || format('%I = coalesce($1.%I, cris_record.%I)', column_name, column_name, column_name);
        else
            updates_todo := updates_todo
            || format('%I = $1.%I', column_name, column_name);
        end if;
    end loop;
    -- join all `set` clauses together
    update_stmt := update_stmt
        || array_to_string(updates_todo, ',')
        || format(' from (select * from db.crashes_cris where db.crashes_cris.crash_id = %s) as cris_record', new.crash_id)
        || format(' where db.crashes_unified.crash_id = %s ', new.crash_id);
    raise notice 'Updating unified crashes record from edit update';
    execute (update_stmt) using new;
    return null;
end;
$$;

create trigger update_crashes_unified_from_crashes_edits_update
after update on db.crashes_edits for each row
execute procedure db.crashes_edits_update();


--
-- handle an units_edits update by updating the
-- unified units record from cris + edit values
--
create or replace function db.units_edits_update()
returns trigger
language plpgsql
as $$
declare
    new_edits_jb jsonb := to_jsonb (new);
    cris_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update db.units_unified set ';
begin
    -- get corresponding the cris record as jsonb
    SELECT to_jsonb(units_cris) INTO cris_record_jb from db.units_cris where db.units_cris.id = new.id;
    -- for every key in the vz json object
    for column_name in select jsonb_object_keys(new_edits_jb) loop
        -- ignore audit fields, except updated_by
        continue when column_name in ('created_at', 'updated_at', 'created_by');
        --  create a set statement for the column
        if cris_record_jb ? column_name then
            -- if this column exists on the cris table, coalesce vz + cris values
            updates_todo := updates_todo
            || format('%I = coalesce($1.%I, cris_record.%I)', column_name, column_name, column_name);
        else
            updates_todo := updates_todo
            || format('%I = $1.%I', column_name, column_name);
        end if;
    end loop;
    -- join all `set` clauses together
    update_stmt := update_stmt
        || array_to_string(updates_todo, ',')
        || format(' from (select * from db.units_cris where db.units_cris.id = %s) as cris_record', new.id)
        || format(' where db.units_unified.id = %s ', new.id);
    raise notice 'Updating unified units record from edit update';
    execute (update_stmt) using new;
    return null;
end;
$$;

create trigger update_units_unified_from_units_edits_update
after update on db.units_edits for each row
execute procedure db.units_edits_update();


--
-- handle an people_edits update by updating the
-- unified people record from cris + edit values
--
create or replace function db.people_edits_update()
returns trigger
language plpgsql
as $$
declare
    new_edits_jb jsonb := to_jsonb (new);
    cris_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update db.people_unified set ';
begin
    -- get corresponding the cris record as jsonb
    SELECT to_jsonb(people_cris) INTO cris_record_jb from db.people_cris where db.people_cris.id = new.id;
    -- for every key in the vz json object
    for column_name in select jsonb_object_keys(new_edits_jb) loop
        -- ignore audit fields, except updated_by
        continue when column_name in ('created_at', 'updated_at', 'created_by');
        --  create a set statement for the column
        if cris_record_jb ? column_name then
            -- if this column exists on the cris table, coalesce vz + cris values
            updates_todo := updates_todo
            || format('%I = coalesce($1.%I, cris_record.%I)', column_name, column_name, column_name);
        else
            updates_todo := updates_todo
            || format('%I = $1.%I', column_name, column_name);
        end if;
    end loop;
    -- join all `set` clauses together
    update_stmt := update_stmt
        || array_to_string(updates_todo, ',')
        || format(' from (select * from db.people_cris where db.people_cris.id = %s) as cris_record', new.id)
        || format(' where db.people_unified.id = %s ', new.id);
    raise notice 'Updating unified people record from edit update';
    execute (update_stmt) using new;
    return null;
end;
$$;

create trigger update_people_unified_from_people_edits_update
after update on db.people_edits for each row
execute procedure db.people_edits_update();

