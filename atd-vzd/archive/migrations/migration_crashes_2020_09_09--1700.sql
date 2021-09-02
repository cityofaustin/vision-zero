--
-- Adds CR3 file metadata column and its indexing method
--
alter table atd_txdot_crashes
	add cr3_file_metadata jsonb default NULL;

create index atd_txdot_crashes_cr3_file_metadata_index
	on atd_txdot_crashes USING gin (cr3_file_metadata);