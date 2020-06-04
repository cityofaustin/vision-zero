-- Adds austin_full_purpose to crashes
ALTER TABLE atd_txdot_crashes
	ADD austin_full_purpose varchar(1) default 'N' not null;

CREATE INDEX atd_txdot_crashes_austin_full_purpose_index
	on atd_txdot_crashes (austin_full_purpose);

