CREATE OR REPLACE TRIGGER atd_txdot_crashes_location_update
    BEFORE UPDATE ON atd_txdot_crashes
    FOR EACH ROW
    EXECUTE FUNCTION crash_location_update();