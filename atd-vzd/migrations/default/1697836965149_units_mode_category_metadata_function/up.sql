CREATE OR REPLACE FUNCTION public.units_mode_category_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
        UPDATE vz_facts.atd_txdot_crashes SET atd_mode_category_metadata = get_crash_modes(crash_id)
        WHERE (vz_facts.atd_txdot_crashes.crash_id = NEW.crash_id);
        RETURN NEW;
    END;
$function$;
