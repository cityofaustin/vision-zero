--
-- Enforces unique records in the primary person table.
--
create index atd_txdot_primaryperson_unique_index
	on atd_txdot_primaryperson (crash_id, unit_nbr, prsn_nbr, prsn_type_id, prsn_occpnt_pos_id);
