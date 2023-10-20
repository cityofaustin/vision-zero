CREATE OR REPLACE FUNCTION public.units_change_log_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.unit_id, old.crash_id, 'units', row_to_json(old));

   RETURN NEW;
END;
$function$;
