ALTER TABLE people ADD CONSTRAINT people_drvr_drg_cat_1_id_fkey FOREIGN KEY (drvr_drg_cat_1_id) REFERENCES lookups.substnc_cat (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_alc_rslt_id_fkey FOREIGN KEY (prsn_alc_rslt_id) REFERENCES lookups.substnc_tst_result (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_alc_spec_type_id_fkey FOREIGN KEY (prsn_alc_spec_type_id) REFERENCES lookups.specimen_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_drg_rslt_id_fkey FOREIGN KEY (prsn_drg_rslt_id) REFERENCES lookups.substnc_tst_result (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_drg_spec_type_id_fkey FOREIGN KEY (prsn_drg_spec_type_id) REFERENCES lookups.specimen_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_ethnicity_id_fkey FOREIGN KEY (prsn_ethnicity_id) REFERENCES lookups.drvr_ethncty (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_gndr_id_fkey FOREIGN KEY (prsn_gndr_id) REFERENCES lookups.gndr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_helmet_id_fkey FOREIGN KEY (prsn_helmet_id) REFERENCES lookups.helmet (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_injry_sev_id_fkey FOREIGN KEY (prsn_injry_sev_id) REFERENCES lookups.injry_sev (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_occpnt_pos_id_fkey FOREIGN KEY (prsn_occpnt_pos_id) REFERENCES lookups.occpnt_pos (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_rest_id_fkey FOREIGN KEY (prsn_rest_id) REFERENCES lookups.rest (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people ADD CONSTRAINT people_prsn_type_id_fkey FOREIGN KEY (prsn_type_id) REFERENCES lookups.prsn_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_drvr_drg_cat_1_id_fkey FOREIGN KEY (drvr_drg_cat_1_id) REFERENCES lookups.substnc_cat (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_alc_rslt_id_fkey FOREIGN KEY (prsn_alc_rslt_id) REFERENCES lookups.substnc_tst_result (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_alc_spec_type_id_fkey FOREIGN KEY (prsn_alc_spec_type_id) REFERENCES lookups.specimen_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_drg_rslt_id_fkey FOREIGN KEY (prsn_drg_rslt_id) REFERENCES lookups.substnc_tst_result (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_drg_spec_type_id_fkey FOREIGN KEY (prsn_drg_spec_type_id) REFERENCES lookups.specimen_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_ethnicity_id_fkey FOREIGN KEY (prsn_ethnicity_id) REFERENCES lookups.drvr_ethncty (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_gndr_id_fkey FOREIGN KEY (prsn_gndr_id) REFERENCES lookups.gndr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_helmet_id_fkey FOREIGN KEY (prsn_helmet_id) REFERENCES lookups.helmet (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_injry_sev_id_fkey FOREIGN KEY (prsn_injry_sev_id) REFERENCES lookups.injry_sev (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_occpnt_pos_id_fkey FOREIGN KEY (prsn_occpnt_pos_id) REFERENCES lookups.occpnt_pos (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_rest_id_fkey FOREIGN KEY (prsn_rest_id) REFERENCES lookups.rest (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_cris ADD CONSTRAINT people_cris_prsn_type_id_fkey FOREIGN KEY (prsn_type_id) REFERENCES lookups.prsn_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_drvr_drg_cat_1_id_fkey FOREIGN KEY (drvr_drg_cat_1_id) REFERENCES lookups.substnc_cat (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_alc_rslt_id_fkey FOREIGN KEY (prsn_alc_rslt_id) REFERENCES lookups.substnc_tst_result (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_alc_spec_type_id_fkey FOREIGN KEY (prsn_alc_spec_type_id) REFERENCES lookups.specimen_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_drg_rslt_id_fkey FOREIGN KEY (prsn_drg_rslt_id) REFERENCES lookups.substnc_tst_result (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_drg_spec_type_id_fkey FOREIGN KEY (prsn_drg_spec_type_id) REFERENCES lookups.specimen_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_ethnicity_id_fkey FOREIGN KEY (prsn_ethnicity_id) REFERENCES lookups.drvr_ethncty (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_gndr_id_fkey FOREIGN KEY (prsn_gndr_id) REFERENCES lookups.gndr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_helmet_id_fkey FOREIGN KEY (prsn_helmet_id) REFERENCES lookups.helmet (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_injry_sev_id_fkey FOREIGN KEY (prsn_injry_sev_id) REFERENCES lookups.injry_sev (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_occpnt_pos_id_fkey FOREIGN KEY (prsn_occpnt_pos_id) REFERENCES lookups.occpnt_pos (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_rest_id_fkey FOREIGN KEY (prsn_rest_id) REFERENCES lookups.rest (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE people_edits ADD CONSTRAINT people_edits_prsn_type_id_fkey FOREIGN KEY (prsn_type_id) REFERENCES lookups.prsn_type (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_autonomous_unit_id_fkey FOREIGN KEY (autonomous_unit_id) REFERENCES lookups.autonomous_unit (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_contrib_factr_1_id_fkey FOREIGN KEY (contrib_factr_1_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_contrib_factr_2_id_fkey FOREIGN KEY (contrib_factr_2_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_contrib_factr_3_id_fkey FOREIGN KEY (contrib_factr_3_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_contrib_factr_p1_id_fkey FOREIGN KEY (contrib_factr_p1_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_contrib_factr_p2_id_fkey FOREIGN KEY (contrib_factr_p2_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_e_scooter_id_fkey FOREIGN KEY (e_scooter_id) REFERENCES lookups.e_scooter (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_first_harm_evt_inv_id_fkey FOREIGN KEY (first_harm_evt_inv_id) REFERENCES lookups.harm_evnt (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_movement_id_fkey FOREIGN KEY (movement_id) REFERENCES lookups.movt (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_pbcat_pedalcyclist_id_fkey FOREIGN KEY (pbcat_pedalcyclist_id) REFERENCES lookups.pbcat_pedalcyclist (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_pbcat_pedestrian_id_fkey FOREIGN KEY (pbcat_pedestrian_id) REFERENCES lookups.pbcat_pedestrian (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_pedalcyclist_action_id_fkey FOREIGN KEY (pedalcyclist_action_id) REFERENCES lookups.pedalcyclist_action (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_pedestrian_action_id_fkey FOREIGN KEY (pedestrian_action_id) REFERENCES lookups.pedestrian_action (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_rpt_autonomous_level_engaged_id_fkey FOREIGN KEY (rpt_autonomous_level_engaged_id) REFERENCES lookups.autonomous_level_engaged (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_unit_desc_id_fkey FOREIGN KEY (unit_desc_id) REFERENCES lookups.unit_desc (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_body_styl_id_fkey FOREIGN KEY (veh_body_styl_id) REFERENCES lookups.veh_body_styl (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_damage_description1_id_fkey FOREIGN KEY (veh_damage_description1_id) REFERENCES lookups.veh_damage_description (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_damage_description2_id_fkey FOREIGN KEY (veh_damage_description2_id) REFERENCES lookups.veh_damage_description (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_damage_direction_of_force1_id_fkey FOREIGN KEY (veh_damage_direction_of_force1_id) REFERENCES lookups.veh_direction_of_force (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_damage_direction_of_force2_id_fkey FOREIGN KEY (veh_damage_direction_of_force2_id) REFERENCES lookups.veh_direction_of_force (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_damage_severity1_id_fkey FOREIGN KEY (veh_damage_severity1_id) REFERENCES lookups.veh_damage_severity (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_damage_severity2_id_fkey FOREIGN KEY (veh_damage_severity2_id) REFERENCES lookups.veh_damage_severity (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_make_id_fkey FOREIGN KEY (veh_make_id) REFERENCES lookups.veh_make (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_mod_id_fkey FOREIGN KEY (veh_mod_id) REFERENCES lookups.veh_mod (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units ADD CONSTRAINT units_veh_trvl_dir_id_fkey FOREIGN KEY (veh_trvl_dir_id) REFERENCES lookups.trvl_dir (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_autonomous_unit_id_fkey FOREIGN KEY (autonomous_unit_id) REFERENCES lookups.autonomous_unit (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_contrib_factr_1_id_fkey FOREIGN KEY (contrib_factr_1_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_contrib_factr_2_id_fkey FOREIGN KEY (contrib_factr_2_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_contrib_factr_3_id_fkey FOREIGN KEY (contrib_factr_3_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_contrib_factr_p1_id_fkey FOREIGN KEY (contrib_factr_p1_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_contrib_factr_p2_id_fkey FOREIGN KEY (contrib_factr_p2_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_e_scooter_id_fkey FOREIGN KEY (e_scooter_id) REFERENCES lookups.e_scooter (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_first_harm_evt_inv_id_fkey FOREIGN KEY (first_harm_evt_inv_id) REFERENCES lookups.harm_evnt (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_pbcat_pedalcyclist_id_fkey FOREIGN KEY (pbcat_pedalcyclist_id) REFERENCES lookups.pbcat_pedalcyclist (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_pbcat_pedestrian_id_fkey FOREIGN KEY (pbcat_pedestrian_id) REFERENCES lookups.pbcat_pedestrian (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_pedalcyclist_action_id_fkey FOREIGN KEY (pedalcyclist_action_id) REFERENCES lookups.pedalcyclist_action (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_pedestrian_action_id_fkey FOREIGN KEY (pedestrian_action_id) REFERENCES lookups.pedestrian_action (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_rpt_autonomous_level_engaged_id_fkey FOREIGN KEY (rpt_autonomous_level_engaged_id) REFERENCES lookups.autonomous_level_engaged (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_unit_desc_id_fkey FOREIGN KEY (unit_desc_id) REFERENCES lookups.unit_desc (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_body_styl_id_fkey FOREIGN KEY (veh_body_styl_id) REFERENCES lookups.veh_body_styl (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_damage_description1_id_fkey FOREIGN KEY (veh_damage_description1_id) REFERENCES lookups.veh_damage_description (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_damage_description2_id_fkey FOREIGN KEY (veh_damage_description2_id) REFERENCES lookups.veh_damage_description (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_damage_direction_of_force1_id_fkey FOREIGN KEY (veh_damage_direction_of_force1_id) REFERENCES lookups.veh_direction_of_force (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_damage_direction_of_force2_id_fkey FOREIGN KEY (veh_damage_direction_of_force2_id) REFERENCES lookups.veh_direction_of_force (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_damage_severity1_id_fkey FOREIGN KEY (veh_damage_severity1_id) REFERENCES lookups.veh_damage_severity (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_damage_severity2_id_fkey FOREIGN KEY (veh_damage_severity2_id) REFERENCES lookups.veh_damage_severity (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_make_id_fkey FOREIGN KEY (veh_make_id) REFERENCES lookups.veh_make (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_mod_id_fkey FOREIGN KEY (veh_mod_id) REFERENCES lookups.veh_mod (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_cris ADD CONSTRAINT units_cris_veh_trvl_dir_id_fkey FOREIGN KEY (veh_trvl_dir_id) REFERENCES lookups.trvl_dir (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_autonomous_unit_id_fkey FOREIGN KEY (autonomous_unit_id) REFERENCES lookups.autonomous_unit (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_contrib_factr_1_id_fkey FOREIGN KEY (contrib_factr_1_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_contrib_factr_2_id_fkey FOREIGN KEY (contrib_factr_2_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_contrib_factr_3_id_fkey FOREIGN KEY (contrib_factr_3_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_contrib_factr_p1_id_fkey FOREIGN KEY (contrib_factr_p1_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_contrib_factr_p2_id_fkey FOREIGN KEY (contrib_factr_p2_id) REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_e_scooter_id_fkey FOREIGN KEY (e_scooter_id) REFERENCES lookups.e_scooter (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_first_harm_evt_inv_id_fkey FOREIGN KEY (first_harm_evt_inv_id) REFERENCES lookups.harm_evnt (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_movement_id_fkey FOREIGN KEY (movement_id) REFERENCES lookups.movt (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_pbcat_pedalcyclist_id_fkey FOREIGN KEY (pbcat_pedalcyclist_id) REFERENCES lookups.pbcat_pedalcyclist (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_pbcat_pedestrian_id_fkey FOREIGN KEY (pbcat_pedestrian_id) REFERENCES lookups.pbcat_pedestrian (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_pedalcyclist_action_id_fkey FOREIGN KEY (pedalcyclist_action_id) REFERENCES lookups.pedalcyclist_action (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_pedestrian_action_id_fkey FOREIGN KEY (pedestrian_action_id) REFERENCES lookups.pedestrian_action (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_rpt_autonomous_level_engaged_id_fkey FOREIGN KEY (rpt_autonomous_level_engaged_id) REFERENCES lookups.autonomous_level_engaged (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_unit_desc_id_fkey FOREIGN KEY (unit_desc_id) REFERENCES lookups.unit_desc (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_body_styl_id_fkey FOREIGN KEY (veh_body_styl_id) REFERENCES lookups.veh_body_styl (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_damage_description1_id_fkey FOREIGN KEY (veh_damage_description1_id) REFERENCES lookups.veh_damage_description (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_damage_description2_id_fkey FOREIGN KEY (veh_damage_description2_id) REFERENCES lookups.veh_damage_description (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_damage_direction_of_force1_id_fkey FOREIGN KEY (veh_damage_direction_of_force1_id) REFERENCES lookups.veh_direction_of_force (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_damage_direction_of_force2_id_fkey FOREIGN KEY (veh_damage_direction_of_force2_id) REFERENCES lookups.veh_direction_of_force (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_damage_severity1_id_fkey FOREIGN KEY (veh_damage_severity1_id) REFERENCES lookups.veh_damage_severity (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_damage_severity2_id_fkey FOREIGN KEY (veh_damage_severity2_id) REFERENCES lookups.veh_damage_severity (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_make_id_fkey FOREIGN KEY (veh_make_id) REFERENCES lookups.veh_make (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_mod_id_fkey FOREIGN KEY (veh_mod_id) REFERENCES lookups.veh_mod (id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE units_edits ADD CONSTRAINT units_edits_veh_trvl_dir_id_fkey FOREIGN KEY (veh_trvl_dir_id) REFERENCES lookups.trvl_dir (id) ON UPDATE CASCADE ON DELETE RESTRICT;