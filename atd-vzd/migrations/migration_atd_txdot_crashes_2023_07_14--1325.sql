-- This trigger updates the city id of a crash to be in Austin if its currently
-- not in Austin and the position value is moved into any of the Austin jurisdictions
CREATE OR REPLACE TRIGGER crashes_position_update_city_id
    BEFORE UPDATE ON atd_txdot_crashes
    FOR EACH ROW
    WHEN (OLD.position IS DISTINCT FROM NEW.position AND NEW.city_id != 22)
    EXECUTE FUNCTION update_crash_city_id();
