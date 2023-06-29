CREATE OR REPLACE FUNCTION public.atd_txdot_units_mode_category_metadata_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
        UPDATE atd_txdot_crashes SET atd_mode_category_metadata = get_crash_modes(crash_id)
        WHERE (atd_txdot_crashes.crash_id = NEW.crash_id);
        RETURN NEW;
    END;
$function$
;