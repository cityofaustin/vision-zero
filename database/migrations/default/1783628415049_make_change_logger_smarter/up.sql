CREATE
OR REPLACE FUNCTION public.insert_change_log ()
RETURNS trigger LANGUAGE plpgsql AS $function$
declare
    update_stmt text := 'insert into public.';
    record_json jsonb;
begin
    IF TG_OP = 'UPDATE' AND
        -- don't create a new change log entry if `updated_at` is the only modified column
        -- this avoids bloating the change log from repeated upserts of the same data
        -- E.g., when importing ems__incidents
       (to_jsonb(NEW) - 'updated_at') = (to_jsonb(OLD) - 'updated_at')
    THEN
        RAISE DEBUG 'No change detected - skipping change log entry';
        RETURN NULL;
    END IF;

    record_json = jsonb_build_object('new', to_jsonb(new), 'old', to_jsonb(old));
    update_stmt := format('insert into public.change_log_%I (record_id, operation_type, record_json, created_by) 
        values (%s, %L, %L, $1.%I)', TG_TABLE_NAME, new.id, TG_OP, record_json, 'updated_by');
    execute (update_stmt) using new;
    return null;
END;
$function$;
