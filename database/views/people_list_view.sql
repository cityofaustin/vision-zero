-- Most recent migration: database/migrations/default/1742417174000_crash_ems_link/up.sql

CREATE OR REPLACE VIEW people_list_view AS SELECT
    people.id,
    people.created_at,
    people.created_by,
    people.drvr_city_name,
    people.drvr_drg_cat_1_id,
    people.drvr_zip,
    people.est_comp_cost_crash_based,
    people.is_deleted,
    people.is_primary_person,
    people.prsn_age,
    people.prsn_alc_rslt_id,
    people.prsn_alc_spec_type_id,
    people.prsn_bac_test_rslt,
    people.prsn_death_timestamp,
    people.prsn_drg_rslt_id,
    people.prsn_drg_spec_type_id,
    people.prsn_ethnicity_id,
    people.prsn_exp_homelessness,
    people.prsn_first_name,
    people.prsn_gndr_id,
    people.prsn_helmet_id,
    people.prsn_injry_sev_id,
    people.prsn_last_name,
    people.prsn_mid_name,
    people.prsn_name_sfx,
    people.prsn_nbr,
    people.prsn_occpnt_pos_id,
    people.prsn_rest_id,
    people.prsn_taken_by,
    people.prsn_taken_to,
    people.prsn_type_id,
    people.unit_id,
    people.updated_at,
    people.updated_by,
    people.years_of_life_lost,
    crashes.id          AS crash_pk,
    crashes.cris_crash_id,
    crashes.crash_timestamp,
    injry_sev.label     AS prsn_injry_sev_desc,
    units.unit_nbr,
    units.unit_desc_id,
    mode_category.label AS mode_desc
FROM people
LEFT JOIN units units ON people.unit_id = units.id
LEFT JOIN people_cris people_cris ON people.id = people_cris.id
LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
LEFT JOIN lookups.injry_sev ON people.prsn_injry_sev_id = injry_sev.id
LEFT JOIN lookups.mode_category ON units.vz_mode_category_id = mode_category.id;
