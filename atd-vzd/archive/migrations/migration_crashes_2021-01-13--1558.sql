--
-- Creates a regular index for the case_id column in atd_txdot_crashes
--

CREATE INDEX atd_txdot_crashes_crash_id_index
	ON atd_txdot_crashes (crash_id);