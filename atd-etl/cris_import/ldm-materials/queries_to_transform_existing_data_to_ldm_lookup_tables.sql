-- this relies on the LDM lookup tables being in place and populated


UPDATE production_fact_tables.atd_txdot_crashes
SET    rpt_cris_cnty_id =
       (
              SELECT id
              FROM   public.cnty
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.rpt_cris_cnty_id::integer ),
       rpt_city_id =
       (
              SELECT id
              FROM   public.city
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.rpt_city_id::integer ),
       rpt_rdwy_sys_id =
       (
              SELECT id
              FROM   public.rwy_sys
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.rpt_rdwy_sys_id::integer ),
       rpt_road_part_id =
       (
              SELECT id
              FROM   public.road_part
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.rpt_road_part_id::integer ),
       rpt_sec_rdwy_sys_id =
       (
              SELECT id
              FROM   public.rwy_sys
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.rpt_sec_rdwy_sys_id::integer ),
       rpt_sec_road_part_id =
       (
              SELECT id
              FROM   public.road_part
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.rpt_sec_road_part_id::integer ),
       wthr_cond_id =
       (
              SELECT id
              FROM   public.wthr_cond
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.wthr_cond_id::integer ),
       light_cond_id =
       (
              SELECT id
              FROM   public.light_cond
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.light_cond_id::integer ),
       entr_road_id =
       (
              SELECT id
              FROM   public.entr_road
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.entr_road_id::integer ),
       road_type_id =
       (
              SELECT id
              FROM   public.road_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.road_type_id::integer ),
       road_algn_id =
       (
              SELECT id
              FROM   public.road_algn
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.road_algn_id::integer ),
       surf_cond_id =
       (
              SELECT id
              FROM   public.surf_cond
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.surf_cond_id::integer ),
       traffic_cntl_id =
       (
              SELECT id
              FROM   public.traffic_cntl
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.traffic_cntl_id::integer ),
       investigat_agency_id =
       (
              SELECT id
              FROM   public.agency
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.investigat_agency_id::integer ),
       bridge_detail_id =
       (
              SELECT id
              FROM   public.bridge_detail
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_detail_id::integer ),
       harm_evnt_id =
       (
              SELECT id
              FROM   public.harm_evnt
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.harm_evnt_id::integer ),
       intrsct_relat_id =
       (
              SELECT id
              FROM   public.intrsct_relat
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.intrsct_relat_id::integer ),
       fhe_collsn_id =
       (
              SELECT id
              FROM   public.collsn
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.fhe_collsn_id::integer ),
       obj_struck_id =
       (
              SELECT id
              FROM   public.obj_struck
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.obj_struck_id::integer ),
       othr_factr_id =
       (
              SELECT id
              FROM   public.othr_factr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.othr_factr_id::integer ),
       road_cls_id =
       (
              SELECT id
              FROM   public.road_cls
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.road_cls_id::integer ),
       road_relat_id =
       (
              SELECT id
              FROM   public.road_relat
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.road_relat_id::integer ),
       phys_featr_1_id =
       (
              SELECT id
              FROM   public.phys_featr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.phys_featr_1_id::integer ),
       phys_featr_2_id =
       (
              SELECT id
              FROM   public.phys_featr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.phys_featr_2_id::integer ),
       city_id =
       (
              SELECT id
              FROM   public.city
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.city_id::integer ),
       crash_sev_id =
       (
              SELECT id
              FROM   public.injry_sev
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.crash_sev_id::integer ),
       pop_group_id =
       (
              SELECT id
              FROM   public.pop_group
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.pop_group_id::integer ),
       hwy_dsgn_lane_id =
       (
              SELECT id
              FROM   public.hwy_dsgn_lane
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.hwy_dsgn_lane_id::integer ),
       hwy_dsgn_hrt_id =
       (
              SELECT id
              FROM   public.hwy_dsgn_hrt
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.hwy_dsgn_hrt_id::integer ),
       base_type_id =
       (
              SELECT id
              FROM   public.base_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.base_type_id::integer ),
       surf_type_id =
       (
              SELECT id
              FROM   public.surf_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.surf_type_id::integer ),
       curb_type_left_id =
       (
              SELECT id
              FROM   public.curb_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.curb_type_left_id::integer ),
       curb_type_right_id =
       (
              SELECT id
              FROM   public.curb_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.curb_type_right_id::integer ),
       shldr_type_left_id =
       (
              SELECT id
              FROM   public.shldr_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.shldr_type_left_id::integer ),
       shldr_use_left_id =
       (
              SELECT id
              FROM   public.shldr_use
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.shldr_use_left_id::integer ),
       shldr_type_right_id =
       (
              SELECT id
              FROM   public.shldr_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.shldr_type_right_id::integer ),
       shldr_use_right_id =
       (
              SELECT id
              FROM   public.shldr_use
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.shldr_use_right_id::integer ),
       median_type_id =
       (
              SELECT id
              FROM   public.median_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.median_type_id::integer ),
       rural_urban_type_id =
       (
              SELECT id
              FROM   public.rural_urban_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.rural_urban_type_id::integer ),
       func_sys_id =
       (
              SELECT id
              FROM   public.func_sys
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.func_sys_id::integer ),
       curve_type_id =
       (
              SELECT id
              FROM   public.curve_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.curve_type_id::integer ),
       delta_left_right_id =
       (
              SELECT id
              FROM   public.delta_left_right
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.delta_left_right_id::integer ),
       bridge_median_id =
       (
              SELECT id
              FROM   public.bridge_median
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_median_id::integer ),
       bridge_loading_type_id =
       (
              SELECT id
              FROM   public.bridge_loading_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_loading_type_id::integer ),
       bridge_srvc_type_on_id =
       (
              SELECT id
              FROM   public.bridge_srvc_type_on
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_srvc_type_on_id::integer ),
       bridge_srvc_type_under_id =
       (
              SELECT id
              FROM   public.bridge_srvc_type_under
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_srvc_type_under_id::integer ),
       culvert_type_id =
       (
              SELECT id
              FROM   public.culvert_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.culvert_type_id::integer ),
       bridge_dir_of_traffic_id =
       (
              SELECT id
              FROM   public.bridge_dir_of_traffic
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_dir_of_traffic_id::integer ),
       bridge_rte_struct_func_id =
       (
              SELECT id
              FROM   public.bridge_rte_struct_func
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_rte_struct_func_id::integer ),
       bridge_ir_struct_func_id =
       (
              SELECT id
              FROM   public.bridge_rte_struct_func
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.bridge_ir_struct_func_id::integer ),
       poscrossing_id =
       (
              SELECT id
              FROM   public.poscrossing
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.poscrossing_id::integer ),
       wdcode_id =
       (
              SELECT id
              FROM   public.wdcode
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_crashes.wdcode_id::integer );

UPDATE production_fact_tables.atd_txdot_units 
SET    unit_desc_id =
       (
              SELECT id
              FROM   public.veh_unit_desc
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.unit_desc_id::integer ),
       veh_lic_state_id =
       (
              SELECT id
              FROM   public.state
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_lic_state_id::integer ),
       veh_mod_year =
       (
              SELECT id
              FROM   public.veh_mod_year
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_mod_year::integer ),
       veh_color_id =
       (
              SELECT id
              FROM   public.veh_color
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_color_id::integer ),
       veh_make_id =
       (
              SELECT id
              FROM   public.veh_make
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_make_id::integer ),
       veh_mod_id =
       (
              SELECT id
              FROM   public.veh_mod
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_mod_id::integer ),
       veh_body_styl_id =
       (
              SELECT id
              FROM   public.veh_body_styl
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_body_styl_id::integer ),
       ownr_state_id =
       (
              SELECT id
              FROM   public.state
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.ownr_state_id::integer ),
       veh_damage_description1_id =
       (
              SELECT id
              FROM   public.veh_damage_description
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_damage_description1_id::integer ),
       veh_damage_severity1_id =
       (
              SELECT id
              FROM   public.veh_damage_severity
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_damage_severity1_id::integer ),
       veh_damage_description2_id =
       (
              SELECT id
              FROM   public.veh_damage_description
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_damage_description2_id::integer ),
       veh_damage_severity2_id =
       (
              SELECT id
              FROM   public.veh_damage_severity
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_damage_severity2_id::integer ),
       cmv_veh_oper_id =
       (
              SELECT id
              FROM   public.cmv_veh_oper
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_veh_oper_id::integer ),
       cmv_carrier_id_type_id =
       (
              SELECT id
              FROM   public.carrier_id_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_carrier_id_type_id::integer ),
       cmv_carrier_state_id =
       (
              SELECT id
              FROM   public.state
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_carrier_state_id::integer ),
       cmv_veh_type_id =
       (
              SELECT id
              FROM   public.cmv_veh_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_veh_type_id::integer ),
       cmv_cargo_body_id =
       (
              SELECT id
              FROM   public.cmv_cargo_body
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_cargo_body_id::integer ),
       cmv_evnt1_id =
       (
              SELECT id
              FROM   public.cmv_evnt
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_evnt1_id::integer ),
       cmv_evnt2_id =
       (
              SELECT id
              FROM   public.cmv_evnt
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_evnt2_id::integer ),
       cmv_evnt3_id =
       (
              SELECT id
              FROM   public.cmv_evnt
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_evnt3_id::integer ),
       cmv_evnt4_id =
       (
              SELECT id
              FROM   public.cmv_evnt
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_evnt4_id::integer ),
       contrib_factr_1_id =
       (
              SELECT id
              FROM   public.contrib_factr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.contrib_factr_1_id::integer ),
       contrib_factr_2_id =
       (
              SELECT id
              FROM   public.contrib_factr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.contrib_factr_2_id::integer ),
       contrib_factr_3_id =
       (
              SELECT id
              FROM   public.contrib_factr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.contrib_factr_3_id::integer ),
       veh_dfct_1_id =
       (
              SELECT id
              FROM   public.unit_dfct
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_dfct_1_id::integer ),
       veh_dfct_2_id =
       (
              SELECT id
              FROM   public.unit_dfct
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_dfct_2_id::integer ),
       veh_dfct_3_id =
       (
              SELECT id
              FROM   public.unit_dfct
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_dfct_3_id::integer ),
       veh_trvl_dir_id =
       (
              SELECT id
              FROM   public.trvl_dir
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.veh_trvl_dir_id::integer ),
       first_harm_evt_inv_id =
       (
              SELECT id
              FROM   public.yes_no_choice
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.first_harm_evt_inv_id::integer ),
       cmv_bus_type_id =
       (
              SELECT id
              FROM   public.bus_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.cmv_bus_type_id::integer ),
       pedestrian_action_id =
       (
              SELECT id
              FROM   public.pedestrian_action
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.pedestrian_action_id::integer ),
       pedalcyclist_action_id =
       (
              SELECT id
              FROM   public.pedalcyclist_action
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.pedalcyclist_action_id::integer ),
       pbcat_pedestrian_id =
       (
              SELECT id
              FROM   public.pbcat_pedestrian
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.pbcat_pedestrian_id::integer ),
       pbcat_pedalcyclist_id =
       (
              SELECT id
              FROM   public.pbcat_pedalcyclist
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.pbcat_pedalcyclist_id::integer ),
       e_scooter_id =
       (
              SELECT id
              FROM   public.e_scooter
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.e_scooter_id::integer ),
       autonomous_unit_id =
       (
              SELECT id
              FROM   public.autonomous_unit
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_units.autonomous_unit_id::integer );

UPDATE production_fact_tables.atd_txdot_person
SET    prsn_type_id =
       (
              SELECT id
              FROM   public.prsn_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_type_id::integer ),
       prsn_occpnt_pos_id =
       (
              SELECT id
              FROM   public.occpnt_pos
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_occpnt_pos_id::integer ),
       prsn_injry_sev_id =
       (
              SELECT id
              FROM   public.injry_sev
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_injry_sev_id::integer ),
       prsn_ethnicity_id =
       (
              SELECT id
              FROM   public.drvr_ethncty
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_ethnicity_id::integer ),
       prsn_gndr_id =
       (
              SELECT id
              FROM   public.gndr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_gndr_id::integer ),
       prsn_ejct_id =
       (
              SELECT id
              FROM   public.ejct
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_ejct_id::integer ),
       prsn_rest_id =
       (
              SELECT id
              FROM   public.rest
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_rest_id::integer ),
       prsn_airbag_id =
       (
              SELECT id
              FROM   public.airbag
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_airbag_id::integer ),
       prsn_helmet_id =
       (
              SELECT id
              FROM   public.helmet
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_helmet_id::integer ),
       prsn_alc_spec_type_id =
       (
              SELECT id
              FROM   public.specimen_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_alc_spec_type_id::integer ),
       prsn_alc_rslt_id =
       (
              SELECT id
              FROM   public.substnc_tst_result
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_alc_rslt_id::integer ),
       prsn_drg_spec_type_id =
       (
              SELECT id
              FROM   public.specimen_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_drg_spec_type_id::integer ),
       prsn_drg_rslt_id =
       (
              SELECT id
              FROM   public.substnc_tst_result
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_person.prsn_drg_rslt_id::integer );

UPDATE production_fact_tables.atd_txdot_primaryperson
SET    prsn_type_id =
       (
              SELECT id
              FROM   public.prsn_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_type_id::integer ),
       prsn_occpnt_pos_id =
       (
              SELECT id
              FROM   public.occpnt_pos
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_occpnt_pos_id::integer ),
       prsn_injry_sev_id =
       (
              SELECT id
              FROM   public.injry_sev
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_injry_sev_id::integer ),
       prsn_ethnicity_id =
       (
              SELECT id
              FROM   public.drvr_ethncty
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_ethnicity_id::integer ),
       prsn_gndr_id =
       (
              SELECT id
              FROM   public.gndr
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_gndr_id::integer ),
       prsn_ejct_id =
       (
              SELECT id
              FROM   public.ejct
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_ejct_id::integer ),
       prsn_rest_id =
       (
              SELECT id
              FROM   public.rest
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_rest_id::integer ),
       prsn_airbag_id =
       (
              SELECT id
              FROM   public.airbag
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_airbag_id::integer ),
       prsn_helmet_id =
       (
              SELECT id
              FROM   public.helmet
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_helmet_id::integer ),
       prsn_alc_spec_type_id =
       (
              SELECT id
              FROM   public.specimen_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_alc_spec_type_id::integer ),
       prsn_alc_rslt_id =
       (
              SELECT id
              FROM   public.substnc_tst_result
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_alc_rslt_id::integer ),
       prsn_drg_spec_type_id =
       (
              SELECT id
              FROM   public.specimen_type
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_drg_spec_type_id::integer ),
       prsn_drg_rslt_id =
       (
              SELECT id
              FROM   public.substnc_tst_result
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.prsn_drg_rslt_id::integer ),
       drvr_drg_cat_1_id =
       (
              SELECT id
              FROM   public.substnc_cat
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.drvr_drg_cat_1_id::integer ),
       --drvr_lic_type_id = ( select id from public.drvr_lic_type where true and source = 'cris' and cris_id = production_fact_tables.atd_txdot_primaryperson.drvr_lic_type_id::integer ),
       --drvr_lic_state_id = ( select id from public.state where true and source = 'cris' and cris_id = production_fact_tables.atd_txdot_primaryperson.drvr_lic_state_id::integer ),
       drvr_lic_cls_id =
       (
              SELECT id
              FROM   public.drvr_lic_cls
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.drvr_lic_cls_id::integer ),
       drvr_state_id =
       (
              SELECT id
              FROM   public.state
              WHERE  true
              AND    source = 'cris'
              AND    cris_id = production_fact_tables.atd_txdot_primaryperson.drvr_state_id::integer );