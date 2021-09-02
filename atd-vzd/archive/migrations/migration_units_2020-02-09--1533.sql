alter table atd_txdot_units
	add atd_mode_category int default 0;


create trigger atd_txdot_units_create_update
    before insert or update
    on atd_txdot_units
    for each row
execute procedure atd_txdot_units_create_update();
