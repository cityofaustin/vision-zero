-- ADD new Travel Direction field 
-- that copy value from veh_trvl_dir_id

ALTER TABLE atd_txdot_units
ADD COLUMN travel_direction_id int4;

UPDATE
	atd_txdot_units
SET
	travel_direction_id = veh_trvl_dir_id;

-- ADD new Movement field
ALTER TABLE atd_txdot_units
ADD COLUMN movement_id int4;

-- CREATE new Movement Lookup table
CREATE TABLE "public"."atd_txdot__movt_lkp"
(
  "movement_id" int4,
  "movement_desc" varchar(128),
  PRIMARY KEY ("movement_id")
);

-- POPULATE Movement Lookup Table
INSERT INTO "public"."atd_txdot__movt_lkp"
  ("movement_id", "movement_desc")
VALUES
  ('1', 'LEFT TURN');
INSERT INTO "public"."atd_txdot__movt_lkp"
  ("movement_id", "movement_desc")
VALUES
  ('2', 'RIGHT TURN');
INSERT INTO "public"."atd_txdot__movt_lkp"
  ("movement_id", "movement_desc")
VALUES
  ('3', 'THROUGH');

-- 1. Run migration above
-- 2. Reload Hasura metadata
-- 3. Give access and update permissions for the new fields in Hasura
-- 4. Track atd_txdot__trvl_dir_lkp & atd_txdot__movt_lkp & atd_txdot__contrib_factr_lkp tables in Hasura
-- 5. Create object relationship for travel_direction_desc on unit table
-- 6. Create object relationship for movement on unit table