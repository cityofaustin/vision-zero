-- makes a list of all duplicate person or primarypesrons
drop materialized view if exists dupe_people;
create materialized view dupe_people as WITH unioned_people AS (
    SELECT
        crash_id::text || '_' || unit_nbr::text || '_' ||prsn_nbr::text as dupe_key,
        primaryperson_id as record_id,
        crash_id,
        unit_nbr,
        prsn_nbr,
        prsn_type_id,
        prsn_occpnt_pos_id,
        prsn_injry_sev_id,
        prsn_age,
        prsn_last_name,
        prsn_first_name,
        prsn_mid_name,
        prsn_gndr_id,
        prsn_ethnicity_id,
        peh_fl AS prsn_exp_homelessness,
        updated_by,
        last_update,
        true as is_primary
    FROM
        atd_txdot_primaryperson
    UNION ALL
    SELECT
        crash_id::text || '_' || unit_nbr::text || '_' ||prsn_nbr::text as dupe_key,
        person_id as record_id,
        crash_id,
        unit_nbr,
        prsn_nbr,
        prsn_type_id,
        prsn_occpnt_pos_id,
        prsn_injry_sev_id,
        prsn_age,
        prsn_last_name,
        prsn_first_name,
        prsn_mid_name,
        prsn_gndr_id,
        prsn_ethnicity_id,
        peh_fl AS prsn_exp_homelessness,
        updated_by,
        last_update,
        false as is_primary
    FROM
        atd_txdot_person
)
SELECT
    p1.dupe_key
    p1.crash_id,
    p1.unit_nbr,
    p1.prsn_nbr,
    p1.record_id,
    p1.prsn_type_id,
    p1.prsn_occpnt_pos_id,
    p1.prsn_injry_sev_id,
    p1.prsn_age,
    p1.prsn_last_name,
    p1.prsn_first_name,
    p1.prsn_mid_name,
    p1.prsn_gndr_id,
    p1.prsn_ethnicity_id,
    p1.prsn_exp_homelessness,
    p1.updated_by,
    p1.last_update,
    p1.is_primary,
    p2.record_id record_id_p2,
    p2.prsn_type_id prsn_type_id_p2,
    p2.prsn_occpnt_pos_id prsn_occpnt_pos_id_p2,
    p2.prsn_injry_sev_id prsn_injry_sev_id_p2,
    p2.prsn_age prsn_age_p2,
    p2.prsn_last_name prsn_last_name_p2,
    p2.prsn_first_name prsn_first_name_p2,
    p2.prsn_mid_name prsn_mid_name_p2,
    p2.prsn_gndr_id prsn_gndr_id_p2,
    p2.prsn_ethnicity_id prsn_ethnicity_id_p2,
    p2.prsn_exp_homelessness prsn_exp_homelessness_p2,
    p2.updated_by updated_by_p2,
    p2.last_update last_update_p2,
    p2.is_primary is_primary_p2,

FROM
    unioned_people p1
left join p2 on
    p1.dupe_key = p2.dupe_key
    and p1.record_id < p2.record_id;
