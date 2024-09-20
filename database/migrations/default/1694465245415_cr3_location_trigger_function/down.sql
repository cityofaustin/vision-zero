-- Remove location id function for insert and update triggers on atd_txdot_crashes
DROP FUNCTION IF EXISTS update_cr3_location() CASCADE;
