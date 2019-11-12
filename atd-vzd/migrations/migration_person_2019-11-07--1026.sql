--
-- This unique index enforces unique records in the persons table.
--
create index atd_txdot_person_unique_index
	on atd_txdot_person (crash_id, unit_nbr, prsn_nbr, prsn_type_id, prsn_occpnt_pos_id);
