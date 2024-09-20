DROP TRIGGER IF EXISTS atd_txdot_units_mode_category_metadata_update ON public.atd_txdot_units;

CREATE TRIGGER atd_txdot_units_mode_category_metadata_update
AFTER UPDATE ON public.atd_txdot_units
FOR EACH ROW
EXECUTE FUNCTION public.atd_txdot_units_mode_category_metadata_update();

COMMENT ON TRIGGER atd_txdot_units_mode_category_metadata_update ON public.atd_txdot_units IS 'Updates the associated crash table atd_mode_category_metadata column when a unit row is updated.';
