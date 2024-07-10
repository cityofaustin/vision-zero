-- create view of all people records which have been edited
create or replace view people_diffs as with unioned_people_edits as (
    select
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
        peh_fl as prsn_exp_homelessness
    from atd_txdot_primaryperson
    union all
    select
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
        peh_fl as prsn_exp_homelessness
    from atd_txdot_person

),

--
-- join "old" people records to new records from cris, where each record is one row with a column for the old value and cris value
--
joined_people as (
    select
        people_cris.id,
        people_edit.crash_id,
        people_cris.unit_nbr,
        people_cris.prsn_nbr,
        people_edit.prsn_type_id as prsn_type_id_edit,
        people_edit.prsn_occpnt_pos_id as prsn_occpnt_pos_id_edit,
        people_edit.prsn_injry_sev_id as prsn_injry_sev_id_edit,
        people_edit.prsn_age as prsn_age_edit,
        people_edit.prsn_last_name as prsn_last_name_edit,
        people_edit.prsn_first_name as prsn_first_name_edit,
        people_edit.prsn_mid_name as prsn_mid_name_edit,
        people_edit.prsn_gndr_id as prsn_gndr_id_edit,
        people_edit.prsn_ethnicity_id as prsn_ethnicity_id_edit,
        people_edit.prsn_exp_homelessness as prsn_exp_homelessness_edit,
        people_cris.prsn_type_id as prsn_type_id_cris,
        people_cris.prsn_occpnt_pos_id as prsn_occpnt_pos_id_cris,
        people_cris.prsn_injry_sev_id as prsn_injry_sev_id_cris,
        people_cris.prsn_age as prsn_age_cris,
        people_cris.prsn_last_name as prsn_last_name_cris,
        people_cris.prsn_first_name as prsn_first_name_cris,
        people_cris.prsn_mid_name as prsn_mid_name_cris,
        people_cris.prsn_gndr_id as prsn_gndr_id_cris,
        people_cris.prsn_ethnicity_id as prsn_ethnicity_id_cris,
        people_cris.prsn_exp_homelessness as prsn_exp_homelessness_cris
    from people_cris
    left join
        unioned_people_edits as people_edit
        on
            people_cris.cris_crash_id = people_edit.crash_id
            and people_cris.unit_nbr = people_edit.unit_nbr
            and people_cris.prsn_nbr = people_edit.prsn_nbr
),

--
-- construct a table that looks a lot like people_edits,
-- where there is a value in each column if it's different from the cris value
--
computed_diffs as (
    select
        id,
        crash_id,
        unit_nbr,
        prsn_nbr,
        case
            when
                prsn_type_id_edit is not null
                and prsn_type_id_edit != prsn_type_id_cris
                then prsn_type_id_edit
        end as prsn_type_id,
        case
            when
                prsn_occpnt_pos_id_edit is not null
                and prsn_occpnt_pos_id_edit != prsn_occpnt_pos_id_cris
                then prsn_occpnt_pos_id_edit
        end as prsn_occpnt_pos_id,
        case
            when
                prsn_injry_sev_id_edit is not null
                and prsn_injry_sev_id_edit != prsn_injry_sev_id_cris
                then prsn_injry_sev_id_edit
        end as prsn_injry_sev_id,
        case
            when
                prsn_age_edit is not null and prsn_age_edit != prsn_age_cris
                then prsn_age_edit
        end as prsn_age,
        case
            when
                prsn_last_name_edit is not null
                and prsn_last_name_edit != prsn_last_name_cris
                then prsn_last_name_edit
        end as prsn_last_name,
        case
            when
                prsn_first_name_edit is not null
                and prsn_first_name_edit != prsn_first_name_cris
                then prsn_first_name_edit
        end as prsn_first_name,
        case
            when
                prsn_mid_name_edit is not null
                and prsn_mid_name_edit != prsn_mid_name_cris
                then prsn_mid_name_edit
        end as prsn_mid_name,
        case
            when
                prsn_gndr_id_edit is not null
                and prsn_gndr_id_edit != prsn_gndr_id_cris
                then prsn_gndr_id_edit
        end as prsn_gndr_id,
        case
            when
                prsn_ethnicity_id_edit is not null
                and prsn_ethnicity_id_edit != prsn_ethnicity_id_cris
                then prsn_ethnicity_id_edit
        end as prsn_ethnicity_id,
        case
            when
                prsn_exp_homelessness_edit is not null
                and prsn_exp_homelessness_edit != prsn_exp_homelessness_cris
                then prsn_exp_homelessness_edit
            else false
        end as prsn_exp_homelessness
    from joined_people
)

select * from computed_diffs
where
    prsn_type_id is not null
    or prsn_occpnt_pos_id is not null
    or prsn_injry_sev_id is not null
    or prsn_age is not null
    or prsn_last_name is not null
    or prsn_first_name is not null
    or prsn_mid_name is not null
    or prsn_gndr_id is not null
    or prsn_ethnicity_id is not null
    or prsn_exp_homelessness is true
order by id asc;


-- Create function to execute updates based on diffs
CREATE OR REPLACE FUNCTION update_people_edits_in_batches(
    batch_size integer DEFAULT 1000
)
RETURNS integer AS $$
DECLARE
    total_rows integer;
    current_offset integer := 0;
BEGIN
    SET client_min_messages TO WARNING;
    -- Get the total number of rows to update
    SELECT count(*) INTO total_rows FROM people_diffs;

    -- Loop through in batches
    WHILE current_offset <= total_rows
    LOOP
        -- Update records in batches
        UPDATE people_edits pe
        SET
            prsn_type_id = pd.prsn_type_id,
            prsn_occpnt_pos_id = pd.prsn_occpnt_pos_id,
            prsn_injry_sev_id = pd.prsn_injry_sev_id,
            prsn_age = pd.prsn_age,
            prsn_last_name = pd.prsn_last_name,
            prsn_first_name = pd.prsn_first_name,
            prsn_mid_name = pd.prsn_mid_name,
            prsn_gndr_id = pd.prsn_gndr_id,
            prsn_ethnicity_id = pd.prsn_ethnicity_id,
            prsn_exp_homelessness = pd.prsn_exp_homelessness
        FROM (
            SELECT id,
                   prsn_type_id,
                   prsn_occpnt_pos_id,
                   prsn_injry_sev_id,
                   prsn_age,
                   prsn_last_name,
                   prsn_first_name,
                   prsn_mid_name,
                   prsn_gndr_id,
                   prsn_ethnicity_id,
                   prsn_exp_homelessness
            FROM people_diffs
            OFFSET current_offset
            LIMIT batch_size
        ) AS pd
        WHERE pe.id = pd.id;

        -- Increment the offset
        current_offset := current_offset + batch_size;

        -- Exit loop if we processed all rows
        EXIT WHEN current_offset >= total_rows;
    END LOOP;
    return total_rows;
END;
$$ LANGUAGE plpgsql;

select update_people_edits_in_batches(1000); -- Specify batch size if needed

-- tear down
drop function update_people_edits_in_batches;
drop view people_diffs;
