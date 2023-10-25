CREATE OR REPLACE FUNCTION public.units_travel_direction()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Copy travel direction from the value cris_facts table
  -- See https://github.com/cityofaustin/atd-data-tech/issues/3038
  NEW.travel_direction = (SELECT veh_trvl_dir_id 
                         FROM cris_facts.atd_txdot_units 
                         WHERE unit_nbr = NEW.unit_nbr 
                         AND crash_id = NEW.crash_id);
  NEW.movement_id = 0;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER units_travel_direction 
BEFORE INSERT ON vz_facts.atd_txdot_units 
FOR EACH ROW EXECUTE FUNCTION public.units_travel_direction();
