CREATE OR REPLACE FUNCTION public.units_travel_direction()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN

  NEW.travel_direction = NEW.veh_trvl_dir_id;
 	NEW.movement_id = 0;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER units_travel_direction 
BEFORE INSERT ON vz_facts.atd_txdot_units 
FOR EACH ROW EXECUTE FUNCTION public.units_travel_direction();
