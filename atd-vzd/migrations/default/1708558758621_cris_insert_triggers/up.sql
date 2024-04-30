create or replace function db.crashes_cris_insert_rows()
returns trigger
language plpgsql
as
$$
BEGIN
    -- insert new combined / official record
    INSERT INTO db.crashes_unified (rpt_block_num, rpt_cris_cnty_id, rpt_ref_mark_offset_amt, rpt_road_part_id, rr_relat_fl, rpt_street_sfx, rpt_sec_street_sfx, rpt_sec_block_num, active_school_zone_fl, surf_type_id, rpt_sec_rdwy_sys_id, rpt_ref_mark_dir, rpt_city_id, rpt_hwy_num, crash_speed_limit, rpt_street_pfx, road_constr_zone_wrkr_fl, rpt_sec_street_name, investigat_agency_id, rpt_sec_street_pfx, longitude, rpt_ref_mark_dist_uom, surf_cond_id, rpt_street_name, obj_struck_id, intrsct_relat_id, fhe_collsn_id, txdot_rptable_fl, latitude, traffic_cntl_id, at_intrsct_fl, crash_id, rpt_sec_road_part_id, wthr_cond_id, investigator_narrative, road_constr_zone_fl, medical_advisory_fl, onsys_fl, crash_time, rpt_sec_street_desc, thousand_damage_fl, toll_road_fl, rpt_street_desc, schl_bus_fl, rpt_sec_hwy_num, light_cond_id, private_dr_fl, rpt_rdwy_sys_id, crash_date, case_id) values (
        new.rpt_block_num, new.rpt_cris_cnty_id, new.rpt_ref_mark_offset_amt, new.rpt_road_part_id, new.rr_relat_fl, new.rpt_street_sfx, new.rpt_sec_street_sfx, new.rpt_sec_block_num, new.active_school_zone_fl, new.surf_type_id, new.rpt_sec_rdwy_sys_id, new.rpt_ref_mark_dir, new.rpt_city_id, new.rpt_hwy_num, new.crash_speed_limit, new.rpt_street_pfx, new.road_constr_zone_wrkr_fl, new.rpt_sec_street_name, new.investigat_agency_id, new.rpt_sec_street_pfx, new.longitude, new.rpt_ref_mark_dist_uom, new.surf_cond_id, new.rpt_street_name, new.obj_struck_id, new.intrsct_relat_id, new.fhe_collsn_id, new.txdot_rptable_fl, new.latitude, new.traffic_cntl_id, new.at_intrsct_fl, new.crash_id, new.rpt_sec_road_part_id, new.wthr_cond_id, new.investigator_narrative, new.road_constr_zone_fl, new.medical_advisory_fl, new.onsys_fl, new.crash_time, new.rpt_sec_street_desc, new.thousand_damage_fl, new.toll_road_fl, new.rpt_street_desc, new.schl_bus_fl, new.rpt_sec_hwy_num, new.light_cond_id, new.private_dr_fl, new.rpt_rdwy_sys_id, new.crash_date, new.case_id
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO db.crashes_edits (crash_id) values (new.crash_id);

    RETURN NULL;
END;
$$;


create or replace trigger insert_new_crashes_cris
after insert on db.crashes_cris
for each row
execute procedure db.crashes_cris_insert_rows();


create or replace function db.units_cris_insert_rows()
returns trigger
language plpgsql
as
$$
BEGIN
    -- insert new combined / official record
    INSERT INTO db.units_unified (vin, pbcat_pedestrian_id, rpt_autonomous_level_engaged_id, contrib_factr_3_id, contrib_factr_p2_id, contrib_factr_1_id, veh_mod_id, contrib_factr_p1_id, pedestrian_action_id, veh_damage_description2_id, veh_mod_year, crash_id, veh_damage_description1_id, contrib_factr_2_id, autonomous_unit_id, unit_desc_id, pbcat_pedalcyclist_id, veh_damage_direction_of_force1_id, first_harm_evt_inv_id, veh_damage_direction_of_force2_id, veh_body_styl_id, veh_trvl_dir_id, e_scooter_id, veh_damage_severity2_id, veh_make_id, id, pedalcyclist_action_id, veh_damage_severity1_id, unit_nbr) values (
        new.vin, new.pbcat_pedestrian_id, new.rpt_autonomous_level_engaged_id, new.contrib_factr_3_id, new.contrib_factr_p2_id, new.contrib_factr_1_id, new.veh_mod_id, new.contrib_factr_p1_id, new.pedestrian_action_id, new.veh_damage_description2_id, new.veh_mod_year, new.crash_id, new.veh_damage_description1_id, new.contrib_factr_2_id, new.autonomous_unit_id, new.unit_desc_id, new.pbcat_pedalcyclist_id, new.veh_damage_direction_of_force1_id, new.first_harm_evt_inv_id, new.veh_damage_direction_of_force2_id, new.veh_body_styl_id, new.veh_trvl_dir_id, new.e_scooter_id, new.veh_damage_severity2_id, new.veh_make_id, new.id, new.pedalcyclist_action_id, new.veh_damage_severity1_id, new.unit_nbr
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO db.units_edits (id) values (new.id);

    RETURN NULL;
END;
$$;


create or replace trigger insert_new_units_cris
after insert on db.units_cris
for each row
execute procedure db.units_cris_insert_rows();


create or replace function db.people_cris_insert_rows()
returns trigger
language plpgsql
as
$$
BEGIN
    -- insert new combined / official record
    INSERT INTO db.people_unified (prsn_drg_spec_type_id, prsn_nbr, prsn_taken_to, prsn_ethnicity_id, prsn_alc_rslt_id, prsn_mid_name, prsn_alc_spec_type_id, drvr_city_name, prsn_death_date, drvr_drg_cat_1_id, prsn_injry_sev_id, prsn_occpnt_pos_id, is_primary_person, prsn_gndr_id, prsn_helmet_id, unit_id, prsn_death_time, prsn_age, prsn_rest_id, prsn_drg_rslt_id, drvr_zip, prsn_last_name, id, prsn_bac_test_rslt, prsn_type_id, prsn_taken_by, prsn_first_name, prsn_name_sfx) values (
        new.prsn_drg_spec_type_id, new.prsn_nbr, new.prsn_taken_to, new.prsn_ethnicity_id, new.prsn_alc_rslt_id, new.prsn_mid_name, new.prsn_alc_spec_type_id, new.drvr_city_name, new.prsn_death_date, new.drvr_drg_cat_1_id, new.prsn_injry_sev_id, new.prsn_occpnt_pos_id, new.is_primary_person, new.prsn_gndr_id, new.prsn_helmet_id, new.unit_id, new.prsn_death_time, new.prsn_age, new.prsn_rest_id, new.prsn_drg_rslt_id, new.drvr_zip, new.prsn_last_name, new.id, new.prsn_bac_test_rslt, new.prsn_type_id, new.prsn_taken_by, new.prsn_first_name, new.prsn_name_sfx
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO db.people_edits (id) values (new.id);

    RETURN NULL;
END;
$$;


create or replace trigger insert_new_people_cris
after insert on db.people_cris
for each row
execute procedure db.people_cris_insert_rows();

