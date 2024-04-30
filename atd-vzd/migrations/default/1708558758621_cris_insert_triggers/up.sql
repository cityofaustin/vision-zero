create or replace function db.crashes_cris_insert_rows()
returns trigger
language plpgsql
as
$$
BEGIN
    -- insert new combined / official record
    INSERT INTO db.crashes_unified (medical_advisory_fl, crash_time, crash_speed_limit, wthr_cond_id, case_id, rpt_street_name, thousand_damage_fl, rpt_ref_mark_dir, traffic_cntl_id, latitude, rpt_road_part_id, road_constr_zone_fl, rpt_city_id, rpt_sec_road_part_id, fhe_collsn_id, at_intrsct_fl, intrsct_relat_id, longitude, onsys_fl, rpt_block_num, surf_cond_id, road_constr_zone_wrkr_fl, rr_relat_fl, schl_bus_fl, light_cond_id, rpt_sec_street_desc, crash_id, rpt_sec_rdwy_sys_id, rpt_sec_hwy_num, rpt_sec_street_name, rpt_sec_street_sfx, crash_date, txdot_rptable_fl, investigat_agency_id, rpt_cris_cnty_id, rpt_ref_mark_offset_amt, obj_struck_id, active_school_zone_fl, rpt_sec_block_num, rpt_street_pfx, rpt_rdwy_sys_id, surf_type_id, toll_road_fl, rpt_street_sfx, rpt_hwy_num, investigator_narrative, rpt_ref_mark_dist_uom, rpt_street_desc, private_dr_fl, rpt_sec_street_pfx) values (
        new.medical_advisory_fl, new.crash_time, new.crash_speed_limit, new.wthr_cond_id, new.case_id, new.rpt_street_name, new.thousand_damage_fl, new.rpt_ref_mark_dir, new.traffic_cntl_id, new.latitude, new.rpt_road_part_id, new.road_constr_zone_fl, new.rpt_city_id, new.rpt_sec_road_part_id, new.fhe_collsn_id, new.at_intrsct_fl, new.intrsct_relat_id, new.longitude, new.onsys_fl, new.rpt_block_num, new.surf_cond_id, new.road_constr_zone_wrkr_fl, new.rr_relat_fl, new.schl_bus_fl, new.light_cond_id, new.rpt_sec_street_desc, new.crash_id, new.rpt_sec_rdwy_sys_id, new.rpt_sec_hwy_num, new.rpt_sec_street_name, new.rpt_sec_street_sfx, new.crash_date, new.txdot_rptable_fl, new.investigat_agency_id, new.rpt_cris_cnty_id, new.rpt_ref_mark_offset_amt, new.obj_struck_id, new.active_school_zone_fl, new.rpt_sec_block_num, new.rpt_street_pfx, new.rpt_rdwy_sys_id, new.surf_type_id, new.toll_road_fl, new.rpt_street_sfx, new.rpt_hwy_num, new.investigator_narrative, new.rpt_ref_mark_dist_uom, new.rpt_street_desc, new.private_dr_fl, new.rpt_sec_street_pfx
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
    INSERT INTO db.units_unified (veh_damage_severity2_id, pbcat_pedestrian_id, contrib_factr_p1_id, veh_damage_severity1_id, veh_damage_description1_id, contrib_factr_2_id, contrib_factr_p2_id, id, pbcat_pedalcyclist_id, unit_desc_id, unit_nbr, pedalcyclist_action_id, veh_damage_description2_id, veh_trvl_dir_id, pedestrian_action_id, crash_id, e_scooter_id, veh_body_styl_id, rpt_autonomous_level_engaged_id, veh_damage_direction_of_force1_id, veh_mod_id, veh_mod_year, veh_make_id, autonomous_unit_id, first_harm_evt_inv_id, vin, veh_damage_direction_of_force2_id, contrib_factr_3_id, contrib_factr_1_id) values (
        new.veh_damage_severity2_id, new.pbcat_pedestrian_id, new.contrib_factr_p1_id, new.veh_damage_severity1_id, new.veh_damage_description1_id, new.contrib_factr_2_id, new.contrib_factr_p2_id, new.id, new.pbcat_pedalcyclist_id, new.unit_desc_id, new.unit_nbr, new.pedalcyclist_action_id, new.veh_damage_description2_id, new.veh_trvl_dir_id, new.pedestrian_action_id, new.crash_id, new.e_scooter_id, new.veh_body_styl_id, new.rpt_autonomous_level_engaged_id, new.veh_damage_direction_of_force1_id, new.veh_mod_id, new.veh_mod_year, new.veh_make_id, new.autonomous_unit_id, new.first_harm_evt_inv_id, new.vin, new.veh_damage_direction_of_force2_id, new.contrib_factr_3_id, new.contrib_factr_1_id
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
    INSERT INTO db.people_unified (prsn_injry_sev_id, prsn_drg_rslt_id, prsn_drg_spec_type_id, prsn_name_sfx, drvr_drg_cat_1_id, prsn_alc_rslt_id, prsn_type_id, prsn_bac_test_rslt, id, prsn_first_name, prsn_gndr_id, is_primary_person, prsn_age, prsn_occpnt_pos_id, drvr_city_name, unit_id, prsn_nbr, prsn_mid_name, prsn_helmet_id, prsn_ethnicity_id, drvr_zip, prsn_taken_by, prsn_rest_id, prsn_death_date, prsn_death_time, prsn_taken_to, prsn_last_name, prsn_alc_spec_type_id) values (
        new.prsn_injry_sev_id, new.prsn_drg_rslt_id, new.prsn_drg_spec_type_id, new.prsn_name_sfx, new.drvr_drg_cat_1_id, new.prsn_alc_rslt_id, new.prsn_type_id, new.prsn_bac_test_rslt, new.id, new.prsn_first_name, new.prsn_gndr_id, new.is_primary_person, new.prsn_age, new.prsn_occpnt_pos_id, new.drvr_city_name, new.unit_id, new.prsn_nbr, new.prsn_mid_name, new.prsn_helmet_id, new.prsn_ethnicity_id, new.drvr_zip, new.prsn_taken_by, new.prsn_rest_id, new.prsn_death_date, new.prsn_death_time, new.prsn_taken_to, new.prsn_last_name, new.prsn_alc_spec_type_id
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

