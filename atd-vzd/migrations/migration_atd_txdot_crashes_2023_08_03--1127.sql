-- Create triggers to update atd_txdot_crashes location_id
CREATE OR REPLACE TRIGGER update_cr3_location_on_insert
BEFORE INSERT ON atd_txdot_crashes
FOR EACH ROW
WHEN (NEW.position IS NOT NULL)
EXECUTE PROCEDURE update_cr3_location();

CREATE OR REPLACE TRIGGER update_cr3_location_on_update
BEFORE UPDATE ON atd_txdot_crashes
FOR EACH ROW
WHEN (OLD.position IS DISTINCT FROM NEW.position)
EXECUTE PROCEDURE update_cr3_location();

COMMENT ON FUNCTION update_cr3_location IS 'This trigger function is used to update the location_id on insert and update of a record in atd_txdot_crashes.';

-- Drop functions that are no longer needed
DROP FUNCTION find_cr3_mainlane_crash;
DROP FUNCTION find_location_for_cr3_collision;
DROP FUNCTION find_location_id_for_cr3_collision;
