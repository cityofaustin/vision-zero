CREATE OR REPLACE FUNCTION get_crash_modes(input_crash_id int)
RETURNS json
AS $$
DECLARE
        totals json;
BEGIN
    SELECT INTO totals json_agg(row_to_json(result))
    FROM (
        SELECT  vmode.mode_id,
                mode.atd_mode_category_mode_name AS mode_desc,
                vmode.unit_id,
                vmode.death_cnt,
                vmode.sus_serious_injry_cnt,
                vmode.nonincap_injry_cnt,
                vmode.poss_injry_cnt,
                vmode.non_injry_cnt,
                vmode.unkn_injry_cnt,
                vmode.tot_injry_cnt
        FROM (
            SELECT unit_id, (
                       CASE
                           -- PEDALCYCLIST / BYCICLE
                           WHEN vdesc.veh_unit_desc_id = 3 THEN 5
                           -- MOTORIZED CONVEYANCE / MICROMOBILITY DEVICE
                           WHEN vdesc.veh_unit_desc_id = 5 THEN 6
                           -- PEDESTRIAN
                           WHEN vdesc.veh_unit_desc_id = 4 THEN 7
                           -- TRAIN
                           WHEN vdesc.veh_unit_desc_id = 2 THEN 8
                           -- MOTOR VEHICLE
                           WHEN vdesc.veh_unit_desc_id = 1 THEN (
                               CASE
                               -- PASSENGER CAR
                               WHEN vbody.veh_body_styl_id IN (100,104) THEN 1
                               -- LARGE PASSENGER CAR
                               WHEN vbody.veh_body_styl_id IN (30, 69, 103, 106) THEN 2
                               -- MOTORCYCLE
                               WHEN vbody.veh_body_styl_id = 71 THEN 3

                               ELSE 4 END
                           ) ELSE 9
                       END
                ) AS mode_id,
                    death_cnt,
                    sus_serious_injry_cnt,
                    nonincap_injry_cnt,
                    poss_injry_cnt,
                    non_injry_cnt,
                    unkn_injry_cnt,
                    tot_injry_cnt

                FROM atd_txdot_units AS atu
                    LEFT JOIN atd_txdot__veh_unit_desc_lkp AS vdesc ON vdesc.veh_unit_desc_id = atu.unit_desc_id
                    LEFT JOIN atd_txdot__veh_body_styl_lkp AS vbody ON vbody.veh_body_styl_id = atu.veh_body_styl_id
                WHERE crash_id = input_crash_id
        ) AS vmode
        LEFT JOIN atd__mode_category_lkp AS mode ON mode.id = vmode.mode_id
    ) AS result;
    RETURN totals;
END; $$
LANGUAGE plpgsql;
