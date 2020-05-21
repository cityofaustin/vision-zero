-- ADDS INDEXING TO crash_date

create index atd_txdot_crashes_crash_date_index
	on atd_txdot_crashes (crash_date);

