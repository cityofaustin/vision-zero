-- trigger when atd_mode_category is changed
CREATE OR REPLACE TRIGGER atd_txdot_units_mode_category_metadata_update
    AFTER UPDATE ON atd_txdot_units
    FOR EACH ROW
    WHEN (OLD.atd_mode_category IS DISTINCT FROM NEW.atd_mode_category)
    EXECUTE FUNCTION atd_txdot_units_mode_category_metadata_update();