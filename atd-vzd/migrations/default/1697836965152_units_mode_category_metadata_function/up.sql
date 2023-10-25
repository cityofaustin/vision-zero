CREATE OR REPLACE FUNCTION public.units_mode_category_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
        UPDATE vz_facts.atd_txdot_crashes SET atd_mode_category_metadata = public.units_get_crash_modes(crash_id)
        WHERE (vz_facts.atd_txdot_crashes.crash_id = NEW.crash_id);
        RETURN NEW;
    END;
$function$;

-- Update the crash mode category metadata when a unit's mode category changes
CREATE TRIGGER units_mode_category_metadata 
AFTER UPDATE ON vz_facts.atd_txdot_units FOR EACH ROW 
WHEN ((old.atd_mode_category IS DISTINCT FROM new.atd_mode_category)) 
EXECUTE FUNCTION public.units_mode_category_metadata();
