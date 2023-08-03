-- Add generated column for non-CR3 crash locations
ALTER TABLE atd_apd_blueform
ADD COLUMN generated_location_id varchar 
GENERATED ALWAYS AS (update_noncr3_location(case_id)) STORED;

-- Drop current atd_apd_blueform location_id column
ALTER TABLE atd_apd_blueform DROP COLUMN location_id;

-- Rename generated_location_id to location_id to replace it
ALTER TABLE atd_apd_blueform 
RENAME COLUMN generated_location_id TO location_id;
