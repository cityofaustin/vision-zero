CREATE OR REPLACE TRIGGER atd_txdot_crashes_update_fatalities
    AFTER UPDATE ON atd_txdot_crashes
    FOR EACH ROW
    EXECUTE FUNCTION update_fatalities_on_crash_update();
