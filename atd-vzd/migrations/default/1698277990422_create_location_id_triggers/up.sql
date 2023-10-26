CREATE OR REPLACE TRIGGER update_cr3_location_on_cris_update
BEFORE UPDATE ON cris_facts.atd_txdot_crashes
FOR EACH ROW
WHEN (OLD.latitude IS DISTINCT FROM NEW.latitude OR OLD.longitude IS DISTINCT FROM NEW.longitude)
EXECUTE PROCEDURE public.update_cr3_location();

CREATE OR REPLACE TRIGGER update_cr3_location_on_vz_update
BEFORE UPDATE ON vz_facts.atd_txdot_crashes
FOR EACH ROW
WHEN ((OLD.latitude IS DISTINCT FROM NEW.latitude) OR (OLD.longitude IS DISTINCT FROM NEW.longitude))
EXECUTE PROCEDURE public.update_cr3_location();

CREATE OR REPLACE TRIGGER update_cr3_location_on_cris_insert
BEFORE INSERT ON cris_facts.atd_txdot_crashes
FOR EACH ROW
EXECUTE PROCEDURE public.update_cr3_location();

CREATE OR REPLACE TRIGGER update_cr3_location_on_vz_insert
BEFORE INSERT ON vz_facts.atd_txdot_crashes
FOR EACH ROW
EXECUTE PROCEDURE public.update_cr3_location();
