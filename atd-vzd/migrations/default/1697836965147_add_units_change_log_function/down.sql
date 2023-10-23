DROP FUNCTION IF EXISTS public.units_change_log_insert();

DROP TRIGGER IF EXISTS units_change_log_insert ON vz_facts.atd_txdot_units;
