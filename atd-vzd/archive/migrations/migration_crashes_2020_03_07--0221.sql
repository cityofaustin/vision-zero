-- We need to drop this index Hasura will not see
drop index idx_atd_txdot_crashes_crash_id;

-- And add a primary key constraint that will be detected by Hasura
alter table atd_txdot_crashes
	add constraint atd_txdot_crashes_pkey
		primary key (crash_id);

alter table atd_txdot_crashes
	add changes_approved_date timestamp default NULL;
