CREATE OR REPLACE FUNCTION public.atd_txdot_person_updates_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cris_id integer; 
BEGIN
    RAISE NOTICE 'TG_TABLE_SCHEMA: %', TG_TABLE_SCHEMA;
    IF (TG_TABLE_SCHEMA = 'cris_facts') THEN
      --RAISE NOTICE 'CRIS SCHEMA';
      INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
      VALUES (old.person_id, old.crash_id, 'person', row_to_json(old));
    ELSE
      --RAISE NOTICE 'VZ SCHEMA';
      SELECT cris_person_id
      INTO cris_id
      FROM public.atd_txdot_person 
      WHERE vz_person_id = NEW.person_id;

      -- are we good with this?  We can't really change the shape of the JSON we're 
      -- sticking in here, and therefore change log system isn't really forwards 
      -- compatible with the ldm. 
      INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
      VALUES (cris_id, old.crash_id, 'person', row_to_json(old));
    END IF;

   RETURN NEW;
END;
$function$
;
