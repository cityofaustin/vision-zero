CREATE OR REPLACE FUNCTION public.insert_change_log()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    update_stmt text := 'insert into public.';
    record_json jsonb;
begin
    record_json = jsonb_build_object('new', to_jsonb(new), 'old', to_jsonb(old));
    update_stmt := format('insert into public.change_log_%I (record_id, operation_type, record_json, created_by) 
        values (%s, %L, %L, $1.%I)', TG_TABLE_NAME, new.id, TG_OP, record_json, 'updated_by');
    execute (update_stmt) using new;
    return null;
END;
$function$
