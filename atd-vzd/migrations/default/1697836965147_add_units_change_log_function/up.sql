-- Insert the previous state of the record from the unified public.atd_txdot_units view into the change log table
CREATE OR REPLACE FUNCTION public.units_change_log_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.unit_id, old.crash_id, 'units', (SELECT row_to_json(atd_txdot_units) FROM public.atd_txdot_units WHERE unit_nbr = old.unit_nbr AND crash_id = old.crash_id));
   RETURN NEW;
END;
$function$;

CREATE TRIGGER units_change_log_insert 
BEFORE UPDATE ON vz_facts.atd_txdot_units 
FOR EACH ROW EXECUTE FUNCTION public.units_change_log_insert();
