-- Adds austin_full_purpose to crashes
ALTER TABLE atd_txdot_crashes
	ADD austin_full_purpose varchar(1) default 'N' not null;
