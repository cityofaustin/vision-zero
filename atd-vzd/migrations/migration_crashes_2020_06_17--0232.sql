--
-- Creates indexes for death count and suspected serious injuries
--
create index atd_txdot_crashes_death_cnt_index
	on atd_txdot_crashes (death_cnt);

create index atd_txdot_crashes_sus_serious_injry_cnt_index
	on atd_txdot_crashes (sus_serious_injry_cnt);
