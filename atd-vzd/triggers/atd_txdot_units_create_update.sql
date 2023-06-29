CREATE OR REPLACE FUNCTION public.atd_txdot_units_create_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.atd_mode_category = (CASE
    -- PEDALCYCLIST / BICYCLE (5)
    WHEN NEW.unit_desc_id = 3 THEN 5
    -- MOTORIZED CONVEYANCE (6)
    WHEN NEW.unit_desc_id = 5 THEN 6
    -- PEDESTRIAN (7)
    WHEN NEW.unit_desc_id = 4 THEN 7
    -- TRAIN (8)
    WHEN NEW.unit_desc_id = 2 THEN 8
    -- MICROMOBILITY DEVICES
    WHEN NEW.unit_desc_id = 177 THEN (
        CASE
        -- E-SCOOTER (11)
        WHEN NEW.veh_body_styl_id = 177 THEN 11
        -- MICROMOBILITY DEVICE (10)
        ELSE 10 END
    )
    -- MOTOR VEHICLES
    WHEN NEW.unit_desc_id = 1 THEN (
        CASE
        -- PASSENGER CAR (1)
        WHEN NEW.veh_body_styl_id IN (100,104) THEN 1
        -- LARGE PASSENGER CAR (2)
        WHEN NEW.veh_body_styl_id IN (30, 69, 103, 106) THEN 2
        -- MOTORCYCLE (3)
        WHEN NEW.veh_body_styl_id IN (71, 90) THEN 3
        -- MOTOR VEHICLE - OTHER (4)
        ELSE 4 END
    ) ELSE 9
    END);

    RETURN NEW;
END;
$function$

alter function atd_txdot_units_create_update() owner to atd_vz_data;
