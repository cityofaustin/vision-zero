CREATE OR REPLACE VIEW public.atd_txdot_person
AS SELECT atd_txdot_person_1.crash_id,
    COALESCE(atd_txdot_person.unit_nbr, atd_txdot_person_1.unit_nbr) AS unit_nbr,
    COALESCE(atd_txdot_person.prsn_nbr, atd_txdot_person_1.prsn_nbr) AS prsn_nbr,
    COALESCE(atd_txdot_person.prsn_type_id, atd_txdot_person_1.prsn_type_id) AS prsn_type_id,
    COALESCE(atd_txdot_person.prsn_occpnt_pos_id, atd_txdot_person_1.prsn_occpnt_pos_id) AS prsn_occpnt_pos_id,
    COALESCE(atd_txdot_person.prsn_name_honorific, atd_txdot_person_1.prsn_name_honorific) AS prsn_name_honorific,
    COALESCE(atd_txdot_person.prsn_last_name, atd_txdot_person_1.prsn_last_name) AS prsn_last_name,
    COALESCE(atd_txdot_person.prsn_first_name, atd_txdot_person_1.prsn_first_name) AS prsn_first_name,
    COALESCE(atd_txdot_person.prsn_mid_name, atd_txdot_person_1.prsn_mid_name) AS prsn_mid_name,
    COALESCE(atd_txdot_person.prsn_name_sfx, atd_txdot_person_1.prsn_name_sfx) AS prsn_name_sfx,
    COALESCE(atd_txdot_person.prsn_injry_sev_id, atd_txdot_person_1.prsn_injry_sev_id) AS prsn_injry_sev_id,
    COALESCE(atd_txdot_person.prsn_age, atd_txdot_person_1.prsn_age) AS prsn_age,
    COALESCE(atd_txdot_person.prsn_ethnicity_id, atd_txdot_person_1.prsn_ethnicity_id) AS prsn_ethnicity_id,
    COALESCE(atd_txdot_person.prsn_gndr_id, atd_txdot_person_1.prsn_gndr_id) AS prsn_gndr_id,
    COALESCE(atd_txdot_person.prsn_ejct_id, atd_txdot_person_1.prsn_ejct_id) AS prsn_ejct_id,
    COALESCE(atd_txdot_person.prsn_rest_id, atd_txdot_person_1.prsn_rest_id) AS prsn_rest_id,
    COALESCE(atd_txdot_person.prsn_airbag_id, atd_txdot_person_1.prsn_airbag_id) AS prsn_airbag_id,
    COALESCE(atd_txdot_person.prsn_helmet_id, atd_txdot_person_1.prsn_helmet_id) AS prsn_helmet_id,
    COALESCE(atd_txdot_person.prsn_sol_fl, atd_txdot_person_1.prsn_sol_fl) AS prsn_sol_fl,
    COALESCE(atd_txdot_person.prsn_alc_spec_type_id, atd_txdot_person_1.prsn_alc_spec_type_id) AS prsn_alc_spec_type_id,
    COALESCE(atd_txdot_person.prsn_alc_rslt_id, atd_txdot_person_1.prsn_alc_rslt_id) AS prsn_alc_rslt_id,
    COALESCE(atd_txdot_person.prsn_bac_test_rslt, atd_txdot_person_1.prsn_bac_test_rslt) AS prsn_bac_test_rslt,
    COALESCE(atd_txdot_person.prsn_drg_spec_type_id, atd_txdot_person_1.prsn_drg_spec_type_id) AS prsn_drg_spec_type_id,
    COALESCE(atd_txdot_person.prsn_drg_rslt_id, atd_txdot_person_1.prsn_drg_rslt_id) AS prsn_drg_rslt_id,
    COALESCE(atd_txdot_person.prsn_taken_to, atd_txdot_person_1.prsn_taken_to) AS prsn_taken_to,
    COALESCE(atd_txdot_person.prsn_taken_by, atd_txdot_person_1.prsn_taken_by) AS prsn_taken_by,
    COALESCE(atd_txdot_person.prsn_death_date, atd_txdot_person_1.prsn_death_date) AS prsn_death_date,
    COALESCE(atd_txdot_person.prsn_death_time, atd_txdot_person_1.prsn_death_time) AS prsn_death_time,
    COALESCE(atd_txdot_person.sus_serious_injry_cnt, atd_txdot_person_1.sus_serious_injry_cnt) AS sus_serious_injry_cnt,
    COALESCE(atd_txdot_person.nonincap_injry_cnt, atd_txdot_person_1.nonincap_injry_cnt) AS nonincap_injry_cnt,
    COALESCE(atd_txdot_person.poss_injry_cnt, atd_txdot_person_1.poss_injry_cnt) AS poss_injry_cnt,
    COALESCE(atd_txdot_person.non_injry_cnt, atd_txdot_person_1.non_injry_cnt) AS non_injry_cnt,
    COALESCE(atd_txdot_person.unkn_injry_cnt, atd_txdot_person_1.unkn_injry_cnt) AS unkn_injry_cnt,
    COALESCE(atd_txdot_person.tot_injry_cnt, atd_txdot_person_1.tot_injry_cnt) AS tot_injry_cnt,
    COALESCE(atd_txdot_person.death_cnt, atd_txdot_person_1.death_cnt) AS death_cnt,
        CASE
            WHEN atd_txdot_person.last_update IS NOT NULL AND atd_txdot_person_1.last_update IS NOT NULL AND atd_txdot_person.last_update > atd_txdot_person_1.last_update THEN atd_txdot_person.last_update
            WHEN atd_txdot_person.last_update IS NOT NULL AND atd_txdot_person_1.last_update IS NOT NULL AND atd_txdot_person.last_update < atd_txdot_person_1.last_update THEN atd_txdot_person_1.last_update
            ELSE COALESCE(atd_txdot_person.last_update, atd_txdot_person_1.last_update)
        END AS last_update,
    COALESCE(atd_txdot_person.updated_by, atd_txdot_person_1.updated_by) AS updated_by,
    COALESCE(atd_txdot_person.person_id, atd_txdot_person_1.person_id) AS person_id,
    COALESCE(atd_txdot_person.is_retired, atd_txdot_person_1.is_retired) AS is_retired,
    COALESCE(atd_txdot_person.years_of_life_lost, atd_txdot_person_1.years_of_life_lost) AS years_of_life_lost
   FROM vz_facts.atd_txdot_person
     JOIN cris_facts.atd_txdot_person atd_txdot_person_1 ON 
       atd_txdot_person.crash_id = atd_txdot_person_1.crash_id AND 
       atd_txdot_person.unit_nbr = atd_txdot_person_1.unit_nbr AND 
       atd_txdot_person.prsn_nbr = atd_txdot_person_1.prsn_nbr;
