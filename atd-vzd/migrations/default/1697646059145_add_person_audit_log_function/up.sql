CREATE OR REPLACE FUNCTION public.atd_txdot_person_updates_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.person_id, old.crash_id, 'person', row_to_json(old));

   RETURN NEW;
END;
$function$
;
