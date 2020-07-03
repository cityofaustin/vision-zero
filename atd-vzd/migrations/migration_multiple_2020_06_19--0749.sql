--
-- We are going to add more indexing for better search performance
--

-- Crash
create index atd_txdot_crashes_crash_fatal_fl_index
	on atd_txdot_crashes (crash_fatal_fl);

-- Units
create index atd_txdot_units_death_cnt_index
	on atd_txdot_units (death_cnt);

create index atd_txdot_units_movement_id_index
	on atd_txdot_units (movement_id);

create index atd_txdot_units_sus_serious_injry_cnt_index
	on atd_txdot_units (sus_serious_injry_cnt);

-- Person:
create index atd_txdot_person_death_cnt_index
	on atd_txdot_person (death_cnt);

create index atd_txdot_person_prsn_death_date_index
	on atd_txdot_person (prsn_death_date);

create index atd_txdot_person_prsn_death_time_index
	on atd_txdot_person (prsn_death_time);

create index atd_txdot_person_sus_serious_injry_cnt_index
	on atd_txdot_person (sus_serious_injry_cnt);

create index atd_txdot_person_years_of_life_lost_index
	on atd_txdot_person (years_of_life_lost);

create index atd_txdot_person_prsn_age_index
	on atd_txdot_person (prsn_age);

create index atd_txdot_person_prsn_ethnicity_id_index
	on atd_txdot_person (prsn_ethnicity_id);

create index atd_txdot_person_prsn_gndr_id_index
	on atd_txdot_person (prsn_gndr_id);

create index atd_txdot_person_prsn_injry_sev_id_index
	on atd_txdot_person (prsn_injry_sev_id);

--- Primary Person

create index atd_txdot_primaryperson_death_cnt_index
	on atd_txdot_primaryperson (death_cnt);

create index atd_txdot_primaryperson_prsn_death_date_index
	on atd_txdot_primaryperson (prsn_death_date);

create index atd_txdot_primaryperson_prsn_death_time_index
	on atd_txdot_primaryperson (prsn_death_time);

create index atd_txdot_primaryperson_sus_serious_injry_cnt_index
	on atd_txdot_primaryperson (sus_serious_injry_cnt);

create index atd_txdot_primaryperson_years_of_life_lost_index
	on atd_txdot_primaryperson (years_of_life_lost);

create index atd_txdot_primaryperson_prsn_age_index
	on atd_txdot_primaryperson (prsn_age);

create index atd_txdot_primaryperson_prsn_ethnicity_id_index
	on atd_txdot_primaryperson (prsn_ethnicity_id);

create index atd_txdot_primaryperson_prsn_gndr_id_index
	on atd_txdot_primaryperson (prsn_gndr_id);

create index atd_txdot_primaryperson_prsn_injry_sev_id_index
	on atd_txdot_primaryperson (prsn_injry_sev_id);
