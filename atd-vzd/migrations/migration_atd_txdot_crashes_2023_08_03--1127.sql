-- Create a stored generated column that finds the location id of a crash 
-- using its geographic position and keeps it updated.
ALTER TABLE atd_txdot_crashes
ADD COLUMN generated_location_id text GENERATED ALWAYS AS (get_cr3_location_id(position, crash_id, rpt_road_part_id, rpt_hwy_num)) STORED;

-- TODO drop DB views that use location_id (replace later with generated location_id)

-- Drop current atd_txdot_crashes location_id column
ALTER TABLE atd_txdot_crashes DROP COLUMN location_id;

-- Rename generated_location_id to location_id to replace it
ALTER TABLE atd_txdot_crashes 
RENAME COLUMN generated_location_id TO location_id;

-- TODO add DB views that use location_id

DROP FUNCTION find_cr3_mainlane_crash();
DROP FUNCTION find_location_for_cr3_collision();
DROP FUNCTION find_location_id_for_cr3_collision();