create or replace view units_diffs as
with joined_units as (
    select
        unit_unified.id,
        unit_unified.unit_nbr as unit_nbr,
        unit_unified.crash_id as crash_id,
        unit_edit.travel_direction as veh_trvl_dir_id_edit,
        unit_edit.movement_id as movement_id_edit,
        unit_edit.unit_desc_id as unit_desc_id_edit,
        unit_edit.veh_body_styl_id as veh_body_styl_id_edit,
        unit_unified.veh_trvl_dir_id as veh_trvl_dir_id_unified,
        unit_unified.movement_id as movement_id_unified,
        unit_unified.unit_desc_id as unit_desc_id_unified,
        unit_unified.veh_body_styl_id as veh_body_styl_id_unified
    from units as unit_unified
    left join
        atd_txdot_units as unit_edit
        on
            unit_unified.cris_crash_id = unit_edit.crash_id
            and unit_unified.unit_nbr = unit_edit.unit_nbr
),

computed_diffs as (
    select
        id,
        unit_nbr,
        crash_id,
        case
            when
                veh_trvl_dir_id_edit != veh_trvl_dir_id_unified
                and veh_trvl_dir_id_edit is not null
                then veh_trvl_dir_id_edit
        end as veh_trvl_dir_id,
        case
            when
                movement_id_edit != movement_id_unified
                and movement_id_edit is not null
                then movement_id_edit
        end as movement_id,
        case
            when
                unit_desc_id_edit != unit_desc_id_unified
                and unit_desc_id_edit is not null
                then unit_desc_id_edit
        end as unit_desc_id,
        case
            when
                veh_body_styl_id_edit != veh_body_styl_id_unified
                and veh_body_styl_id_edit is not null
                then veh_body_styl_id_edit
        end as veh_body_styl_id
    from joined_units
)

select * from computed_diffs   where
        veh_trvl_dir_id is not null
        or movement_id is not null
        or unit_desc_id is not null
        or veh_body_styl_id is not null
        order by id asc;

create or replace function update_units_edits_in_batches(
    batch_size integer default 1000
)
returns integer as $$
DECLARE
    total_rows integer;
    current_offset integer := 0;
BEGIN
    SET client_min_messages TO WARNING;
    -- Get the total number of rows to update
    SELECT count(*) INTO total_rows FROM units_diffs;

    -- Loop through in batches
    WHILE current_offset <= total_rows
    LOOP
        -- Update records in batches

        update units_edits
        set
            veh_trvl_dir_id = unit_updates.veh_trvl_dir_id,
            movement_id = unit_updates.movement_id,
            unit_desc_id = unit_updates.unit_desc_id,
            veh_body_styl_id = unit_updates.veh_body_styl_id,
            updated_by = 'legacy-vz-user'
        from (
            select * from units_diffs
                OFFSET current_offset
                LIMIT batch_size
        )
        as unit_updates
        where units_edits.id = unit_updates.id;

        -- Increment the offset
        current_offset := current_offset + batch_size;

        -- Exit loop if we processed all rows
        EXIT WHEN current_offset >= total_rows;
    END LOOP;
    return total_rows;
END;
$$ language plpgsql;

select update_units_edits_in_batches(1000);
-- tear down

drop function update_units_edits_in_batches;
drop view units_diffs;
