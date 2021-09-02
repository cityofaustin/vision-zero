-- Added index for city_id on crashes table
create index atd_txdot_crashes_city_id_index
	on atd_txdot_crashes (city_id);
