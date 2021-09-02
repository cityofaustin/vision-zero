CREATE OR REPLACE FUNCTION public.atd_txdot_units_create_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.atd_mode_category = (CASE
       -- PEDALCYCLIST / BYCICLE
       WHEN NEW.unit_desc_id = 3 THEN 5
       -- MOTORIZED CONVEYANCE / MICROMOBILITY DEVICE
       WHEN NEW.unit_desc_id = 5 THEN 6
       -- PEDESTRIAN
       WHEN NEW.unit_desc_id = 4 THEN 7
       -- TRAIN
       WHEN NEW.unit_desc_id = 2 THEN 8
       -- MOTOR VEHICLE
       WHEN NEW.unit_desc_id = 1 THEN (
           CASE
           -- PASSENGER CAR
           WHEN NEW.veh_body_styl_id IN (100,104) THEN 1
           -- LARGE PASSENGER CAR
           WHEN NEW.veh_body_styl_id IN (30, 69, 103, 106) THEN 2
           -- MOTORCYCLE
           WHEN NEW.veh_body_styl_id = 71 THEN 3

           ELSE 4 END
       ) ELSE 9
    END);

    RETURN NEW;
END;
$function$

alter function atd_txdot_units_create_update() owner to atd_vz_data;
