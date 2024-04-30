-- location A187DE10F4, in_austin_full_purpose true, council_district 9
insert into db.crashes_cris (crash_id, latitude, longitude) values (1, 30.2800238, -97.743370);
insert into db.units_cris (unit_nbr, crash_id) values (1, 1);
insert into db.people_cris (prsn_nbr, unit_nbr, crash_id) values (1, 1, 1);
insert into db.charges_cris (prsn_nbr, unit_nbr, crash_id, charge) values (1, 1, 1, 'whatever');

-- location null, in_austin_full_purpose false, council_district null
update db.crashes_cris set active_school_zone_fl = TRUE, latitude = null where crash_id = 1;
update db.units_cris set vin = 'abcdefg' where id = 1;
update db.people_cris set drvr_city_name = 'austin' where id = 1;

-- location AA7729AE83, in_austin_full_purpose true, council_district 7
update db.crashes_edits set
    active_school_zone_fl = FALSE,
    latitude = 30.36444128,
    longitude = -97.72865645 where crash_id = 1;
update db.units_edits set vin = 'hijklmno' where id = 1;
update db.people_edits set drvr_city_name = 'austin edited' where id = 1;
