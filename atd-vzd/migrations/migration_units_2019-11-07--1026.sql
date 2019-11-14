--
-- Enforces unique records in the Units table
--
create index atd_txdot_units_unique_index
	on atd_txdot_units (crash_id, unit_nbr);