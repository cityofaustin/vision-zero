-- location A187DE10F4, in_austin_full_purpose true, council_district 9, engineering_area 2
insert into db.crashes_cris (
    crash_id, latitude, longitude, created_by, updated_by, cris_schema_version)
    values (1, 30.2800238, -97.743370, 'cris', 'cris', '2023');
insert into db.units_cris (unit_nbr, crash_id) values (1, 1);
insert into db.people_cris (prsn_nbr, unit_nbr, crash_id) values (1, 1, 1);
insert into db.charges_cris (prsn_nbr, unit_nbr, crash_id, charge) values (1, 1, 1, 'whatever');

-- location null, in_austin_full_purpose false, council_district null
update db.crashes_cris set active_school_zone_fl = TRUE, latitude = null where crash_id = 1;
update db.units_cris set vin = 'abcdefg' where id = 1;
update db.people_cris set drvr_city_name = 'austin' where id = 1;

-- location AA7729AE83, in_austin_full_purpose true, council_district 7, engineering_area 2
update db.crashes_edits set
    active_school_zone_fl = FALSE,
    latitude = 30.36444128,
    longitude = -97.72865645,
    updated_by = 'vz-user@austintexas.gov'
    where crash_id = 1;
update db.units_edits set vin = 'hijklmno' where id = 1;
update db.people_edits set drvr_city_name = 'austin edited', peh_fl = true where id = 1;

-- try to use custom lookup value in CRIS schema
-- this should fail due to people_cris_prsn_injry_sev_id_check
update db.people_cris set prsn_injry_sev_id = 99 where id = 1;
