/* VEH_DMAG_SCL1_ID --> VEH_DAMAGE_SEVERITY1_ID */
UPDATE
	atd_txdot_units
SET
	veh_damage_severity1_id = veh_dmag_scl_1_id
WHERE
	veh_damage_severity1_id IS NULL;


/* VEH_DMAG_SCL2_ID --> VEH_DAMAGE_SEVERITY2_ID */
UPDATE
	atd_txdot_units
SET
	veh_damage_severity2_id = veh_dmag_scl_2_id
WHERE
	veh_damage_severity2_id IS NULL;


/* VEH_DMAG_AREA1_ID --> VEH_DAMAGE_DESCRIPTION1_ID */
UPDATE
	atd_txdot_units
SET
	veh_damage_description1_id = veh_dmag_area_1_id
WHERE
    1 = 1 
	-- veh_damage_description1_id IS NULL;


/* VEH_DMAG_AREA2_ID --> VEH_DAMAGE_DESCRIPTION2_ID */
UPDATE
	atd_txdot_units
SET
	veh_damage_description2_id = veh_dmag_area_2_id
WHERE
	veh_damage_description2_id IS NULL;


/* FORCE_DIR1_ID --> VEH_DIRECTION_OF_FORCE1_ID */
UPDATE
	atd_txdot_units
SET
	veh_damage_direction_of_force1_id = force_dir_1_id
WHERE
	veh_damage_direction_of_force1_id IS NULL;


/* FORCE_DIR2_ID --> VEH_DIRECTION_OF_FORCE2_ID */
UPDATE
	atd_txdot_units
SET
	veh_damage_direction_of_force2_id = force_dir_2_id
WHERE
	veh_damage_direction_of_force2_id IS NULL;


ALTER TABLE "public"."atd_txdot_units" 
DROP COLUMN "veh_dmag_area_1_id",
DROP COLUMN "veh_dmag_scl_1_id",
DROP COLUMN "force_dir_1_id",
DROP COLUMN "veh_dmag_area_2_id",
DROP COLUMN "veh_dmag_scl_2_id",
DROP COLUMN "force_dir_2_id";