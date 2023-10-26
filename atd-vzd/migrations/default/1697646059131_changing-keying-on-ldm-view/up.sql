CREATE OR REPLACE VIEW public.atd_txdot_person
AS SELECT cris_atd_txdot_person.crash_id,
    COALESCE(vz_atd_txdot_person.unit_nbr, cris_atd_txdot_person.unit_nbr) AS unit_nbr,
    COALESCE(vz_atd_txdot_person.prsn_nbr, cris_atd_txdot_person.prsn_nbr) AS prsn_nbr,
    COALESCE(vz_atd_txdot_person.prsn_type_id, cris_atd_txdot_person.prsn_type_id) AS prsn_type_id,
    COALESCE(vz_atd_txdot_person.prsn_occpnt_pos_id, cris_atd_txdot_person.prsn_occpnt_pos_id) AS prsn_occpnt_pos_id,
    COALESCE(vz_atd_txdot_person.prsn_name_honorific, cris_atd_txdot_person.prsn_name_honorific) AS prsn_name_honorific,
    COALESCE(vz_atd_txdot_person.prsn_last_name, cris_atd_txdot_person.prsn_last_name) AS prsn_last_name,
    COALESCE(vz_atd_txdot_person.prsn_first_name, cris_atd_txdot_person.prsn_first_name) AS prsn_first_name,
    COALESCE(vz_atd_txdot_person.prsn_mid_name, cris_atd_txdot_person.prsn_mid_name) AS prsn_mid_name,
    COALESCE(vz_atd_txdot_person.prsn_name_sfx, cris_atd_txdot_person.prsn_name_sfx) AS prsn_name_sfx,
    COALESCE(vz_atd_txdot_person.prsn_injry_sev_id, cris_atd_txdot_person.prsn_injry_sev_id) AS prsn_injry_sev_id,
    COALESCE(vz_atd_txdot_person.prsn_age, cris_atd_txdot_person.prsn_age) AS prsn_age,
    COALESCE(vz_atd_txdot_person.prsn_ethnicity_id, cris_atd_txdot_person.prsn_ethnicity_id) AS prsn_ethnicity_id,
    COALESCE(vz_atd_txdot_person.prsn_gndr_id, cris_atd_txdot_person.prsn_gndr_id) AS prsn_gndr_id,
    COALESCE(vz_atd_txdot_person.prsn_ejct_id, cris_atd_txdot_person.prsn_ejct_id) AS prsn_ejct_id,
    COALESCE(vz_atd_txdot_person.prsn_rest_id, cris_atd_txdot_person.prsn_rest_id) AS prsn_rest_id,
    COALESCE(vz_atd_txdot_person.prsn_airbag_id, cris_atd_txdot_person.prsn_airbag_id) AS prsn_airbag_id,
    COALESCE(vz_atd_txdot_person.prsn_helmet_id, cris_atd_txdot_person.prsn_helmet_id) AS prsn_helmet_id,
    COALESCE(vz_atd_txdot_person.prsn_sol_fl, cris_atd_txdot_person.prsn_sol_fl) AS prsn_sol_fl,
    COALESCE(vz_atd_txdot_person.prsn_alc_spec_type_id, cris_atd_txdot_person.prsn_alc_spec_type_id) AS prsn_alc_spec_type_id,
    COALESCE(vz_atd_txdot_person.prsn_alc_rslt_id, cris_atd_txdot_person.prsn_alc_rslt_id) AS prsn_alc_rslt_id,
    COALESCE(vz_atd_txdot_person.prsn_bac_test_rslt, cris_atd_txdot_person.prsn_bac_test_rslt) AS prsn_bac_test_rslt,
    COALESCE(vz_atd_txdot_person.prsn_drg_spec_type_id, cris_atd_txdot_person.prsn_drg_spec_type_id) AS prsn_drg_spec_type_id,
    COALESCE(vz_atd_txdot_person.prsn_drg_rslt_id, cris_atd_txdot_person.prsn_drg_rslt_id) AS prsn_drg_rslt_id,
    COALESCE(vz_atd_txdot_person.prsn_taken_to, cris_atd_txdot_person.prsn_taken_to) AS prsn_taken_to,
    COALESCE(vz_atd_txdot_person.prsn_taken_by, cris_atd_txdot_person.prsn_taken_by) AS prsn_taken_by,
    COALESCE(vz_atd_txdot_person.prsn_death_date, cris_atd_txdot_person.prsn_death_date) AS prsn_death_date,
    COALESCE(vz_atd_txdot_person.prsn_death_time, cris_atd_txdot_person.prsn_death_time) AS prsn_death_time,
    COALESCE(vz_atd_txdot_person.sus_serious_injry_cnt, cris_atd_txdot_person.sus_serious_injry_cnt) AS sus_serious_injry_cnt,
    COALESCE(vz_atd_txdot_person.nonincap_injry_cnt, cris_atd_txdot_person.nonincap_injry_cnt) AS nonincap_injry_cnt,
    COALESCE(vz_atd_txdot_person.poss_injry_cnt, cris_atd_txdot_person.poss_injry_cnt) AS poss_injry_cnt,
    COALESCE(vz_atd_txdot_person.non_injry_cnt, cris_atd_txdot_person.non_injry_cnt) AS non_injry_cnt,
    COALESCE(vz_atd_txdot_person.unkn_injry_cnt, cris_atd_txdot_person.unkn_injry_cnt) AS unkn_injry_cnt,
    COALESCE(vz_atd_txdot_person.tot_injry_cnt, cris_atd_txdot_person.tot_injry_cnt) AS tot_injry_cnt,
    COALESCE(vz_atd_txdot_person.death_cnt, cris_atd_txdot_person.death_cnt) AS death_cnt,
        CASE
            WHEN vz_atd_txdot_person.last_update IS NOT NULL AND cris_atd_txdot_person.last_update IS NOT NULL AND vz_atd_txdot_person.last_update > cris_atd_txdot_person.last_update THEN vz_atd_txdot_person.last_update
            WHEN vz_atd_txdot_person.last_update IS NOT NULL AND cris_atd_txdot_person.last_update IS NOT NULL AND vz_atd_txdot_person.last_update < cris_atd_txdot_person.last_update THEN cris_atd_txdot_person.last_update
            ELSE COALESCE(vz_atd_txdot_person.last_update, cris_atd_txdot_person.last_update)
        END AS last_update,
    COALESCE(vz_atd_txdot_person.updated_by, cris_atd_txdot_person.updated_by) AS updated_by,
    COALESCE(vz_atd_txdot_person.person_id, cris_atd_txdot_person.person_id) AS person_id,
    COALESCE(vz_atd_txdot_person.is_retired, cris_atd_txdot_person.is_retired) AS is_retired,
    COALESCE(vz_atd_txdot_person.years_of_life_lost, cris_atd_txdot_person.years_of_life_lost) AS years_of_life_lost
   FROM vz_facts.atd_txdot_person vz_atd_txdot_person
     JOIN cris_facts.atd_txdot_person cris_atd_txdot_person ON 
       vz_atd_txdot_person.crash_id = cris_atd_txdot_person.crash_id AND 
       vz_atd_txdot_person.unit_nbr = cris_atd_txdot_person.unit_nbr AND 
       vz_atd_txdot_person.prsn_nbr = cris_atd_txdot_person.prsn_nbr;
