-- Add generated column for non-CR3 crash locations
ALTER TABLE atd_apd_blueform
ADD COLUMN generated_location_id varchar 
GENERATED ALWAYS AS (update_noncr3_location(case_id)) STORED;