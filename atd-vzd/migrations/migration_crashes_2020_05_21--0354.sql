-- ADDS INDEXING TO crash_date
create index atd_txdot_crashes_crash_date_index
	on atd_txdot_crashes (crash_date);

-- ADDS INDEXING TO AGENCY ID
create index atd_txdot_crashes_investigat_agency_id_index
	on atd_txdot_crashes (investigat_agency_id);
