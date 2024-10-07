create table public.crashes_edits (
    id integer primary key references public.crashes_cris (id) on update cascade on delete cascade,
    active_school_zone_fl boolean,
    at_intrsct_fl boolean,
    case_id text,
    cr3_processed_at timestamp with time zone,
    cr3_stored_fl boolean,
    crash_speed_limit integer,
    crash_timestamp timestamp with time zone,
    created_at timestamptz not null default now(),
    created_by text not null default 'system',
    cris_crash_id integer unique,
    fhe_collsn_id integer references lookups.collsn (id) on update cascade on delete cascade,
    intrsct_relat_id integer references lookups.intrsct_relat (id) on update cascade on delete cascade,
    investigat_agency_id integer references lookups.agency (id) on update cascade on delete cascade,
    investigator_narrative text,
    is_deleted boolean,
    is_temp_record boolean,
    latitude numeric,
    law_enforcement_ytd_fatality_num text,
    light_cond_id integer references lookups.light_cond (id) on update cascade on delete cascade,
    longitude numeric,
    medical_advisory_fl boolean,
    obj_struck_id integer references lookups.obj_struck (id) on update cascade on delete cascade,
    onsys_fl boolean,
    private_dr_fl boolean,
    road_constr_zone_fl boolean,
    road_constr_zone_wrkr_fl boolean,
    rpt_block_num text,
    rpt_city_id integer references lookups.city (id) on update cascade on delete cascade,
    rpt_cris_cnty_id integer references lookups.cnty (id) on update cascade on delete cascade,
    rpt_hwy_num text,
    rpt_hwy_sfx text,
    rpt_rdwy_sys_id integer references lookups.rwy_sys (id) on update cascade on delete cascade,
    rpt_ref_mark_dir text,
    rpt_ref_mark_dist_uom text,
    rpt_ref_mark_nbr text,
    rpt_ref_mark_offset_amt numeric,
    rpt_road_part_id integer references lookups.road_part (id) on update cascade on delete cascade,
    rpt_sec_block_num text,
    rpt_sec_hwy_num text,
    rpt_sec_hwy_sfx text,
    rpt_sec_rdwy_sys_id integer references lookups.rwy_sys (id) on update cascade on delete cascade,
    rpt_sec_road_part_id integer references lookups.road_part (id) on update cascade on delete cascade,
    rpt_sec_street_desc text,
    rpt_sec_street_name text,
    rpt_sec_street_pfx text,
    rpt_sec_street_sfx text,
    rpt_street_desc text,
    rpt_street_name text,
    rpt_street_pfx text,
    rpt_street_sfx text,
    rr_relat_fl boolean,
    schl_bus_fl boolean,
    surf_cond_id integer references lookups.surf_cond (id) on update cascade on delete cascade,
    surf_type_id integer references lookups.surf_type (id) on update cascade on delete cascade,
    thousand_damage_fl boolean,
    toll_road_fl boolean,
    traffic_cntl_id integer references lookups.traffic_cntl (id) on update cascade on delete cascade,
    txdot_rptable_fl boolean,
    updated_at timestamptz not null default now(),
    updated_by text not null default 'system',
    wthr_cond_id integer references lookups.wthr_cond (id) on update cascade on delete cascade
);

create table public.change_log_crashes_edits (
    id serial primary key,
    record_id integer not null references public.crashes_edits (id) on delete cascade on update cascade,
    operation_type text not null,
    record_json jsonb not null,
    created_at timestamp with time zone default now(),
    created_by text not null
);

create index on public.change_log_crashes_edits (record_id);

drop trigger if exists insert_new_crashes_cris on public.crashes_cris;

drop function if exists public.crashes_cris_insert_rows;

create or replace function public.crashes_cris_insert_rows()
returns trigger
language plpgsql
as
$$
BEGIN
    -- insert new combined / official record
    INSERT INTO public.crashes (
        active_school_zone_fl,
        at_intrsct_fl,
        case_id,
        cr3_processed_at,
        cr3_stored_fl,
        crash_speed_limit,
        crash_timestamp,
        created_by,
        cris_crash_id,
        fhe_collsn_id,
        id,
        intrsct_relat_id,
        investigat_agency_id,
        investigator_narrative,
        is_deleted,
        is_temp_record,
        latitude,
        light_cond_id,
        longitude,
        medical_advisory_fl,
        obj_struck_id,
        onsys_fl,
        private_dr_fl,
        road_constr_zone_fl,
        road_constr_zone_wrkr_fl,
        rpt_block_num,
        rpt_city_id,
        rpt_cris_cnty_id,
        rpt_hwy_num,
        rpt_hwy_sfx,
        rpt_rdwy_sys_id,
        rpt_ref_mark_dir,
        rpt_ref_mark_dist_uom,
        rpt_ref_mark_nbr,
        rpt_ref_mark_offset_amt,
        rpt_road_part_id,
        rpt_sec_block_num,
        rpt_sec_hwy_num,
        rpt_sec_hwy_sfx,
        rpt_sec_rdwy_sys_id,
        rpt_sec_road_part_id,
        rpt_sec_street_desc,
        rpt_sec_street_name,
        rpt_sec_street_pfx,
        rpt_sec_street_sfx,
        rpt_street_desc,
        rpt_street_name,
        rpt_street_pfx,
        rpt_street_sfx,
        rr_relat_fl,
        schl_bus_fl,
        surf_cond_id,
        surf_type_id,
        thousand_damage_fl,
        toll_road_fl,
        traffic_cntl_id,
        txdot_rptable_fl,
        updated_by,
        wthr_cond_id
    ) values (
        new.active_school_zone_fl,
        new.at_intrsct_fl,
        new.case_id,
        new.cr3_processed_at,
        new.cr3_stored_fl,
        new.crash_speed_limit,
        new.crash_timestamp,
        new.created_by,
        new.cris_crash_id,
        new.fhe_collsn_id,
        new.id,
        new.intrsct_relat_id,
        new.investigat_agency_id,
        new.investigator_narrative,
        new.is_deleted,
        new.is_temp_record,
        new.latitude,
        new.light_cond_id,
        new.longitude,
        new.medical_advisory_fl,
        new.obj_struck_id,
        new.onsys_fl,
        new.private_dr_fl,
        new.road_constr_zone_fl,
        new.road_constr_zone_wrkr_fl,
        new.rpt_block_num,
        new.rpt_city_id,
        new.rpt_cris_cnty_id,
        new.rpt_hwy_num,
        new.rpt_hwy_sfx,
        new.rpt_rdwy_sys_id,
        new.rpt_ref_mark_dir,
        new.rpt_ref_mark_dist_uom,
        new.rpt_ref_mark_nbr,
        new.rpt_ref_mark_offset_amt,
        new.rpt_road_part_id,
        new.rpt_sec_block_num,
        new.rpt_sec_hwy_num,
        new.rpt_sec_hwy_sfx,
        new.rpt_sec_rdwy_sys_id,
        new.rpt_sec_road_part_id,
        new.rpt_sec_street_desc,
        new.rpt_sec_street_name,
        new.rpt_sec_street_pfx,
        new.rpt_sec_street_sfx,
        new.rpt_street_desc,
        new.rpt_street_name,
        new.rpt_street_pfx,
        new.rpt_street_sfx,
        new.rr_relat_fl,
        new.schl_bus_fl,
        new.surf_cond_id,
        new.surf_type_id,
        new.thousand_damage_fl,
        new.toll_road_fl,
        new.traffic_cntl_id,
        new.txdot_rptable_fl,
        new.updated_by,
        new.wthr_cond_id
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO public.crashes_edits (id) values (new.id);

    RETURN NULL;
END;
$$;

create or replace trigger insert_new_crashes_cris
after insert on public.crashes_cris
for each row
execute procedure public.crashes_cris_insert_rows();

drop trigger if exists update_crashes_from_crashes_cris_update on public.crashes_cris;

drop function if exists public.crashes_cris_update;

--
-- handle a cris crashes update by updating the
-- unified crashes record from cris + vz values
--
create or replace function public.crashes_cris_update()
returns trigger
language plpgsql
as $$
declare
    new_cris_jb jsonb := to_jsonb (new);
    old_cris_jb jsonb := to_jsonb (old);
    edit_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update public.crashes set ';
begin
    -- get corresponding the VZ record as jsonb
    SELECT to_jsonb(crashes_edits) INTO edit_record_jb from public.crashes_edits where public.crashes_edits.id = new.id;

    -- for every key in the cris json object
    for column_name in select jsonb_object_keys(new_cris_jb) loop
        -- ignore audit fields
        continue when column_name in ('created_at', 'updated_at', 'created_by', 'updated_by');
        -- if the new value doesn't match the old
        if(new_cris_jb -> column_name <> old_cris_jb -> column_name) then
            -- see if the vz record has a value for this field
            if (edit_record_jb ->> column_name is  null) then
                -- this value is not overridden by VZ
                -- so update the unified record with this new value
                updates_todo := updates_todo || format('%I = $1.%I', column_name, column_name);
            end if;
        end if;
    end loop;
    if(array_length(updates_todo, 1) > 0) then
        -- set audit field updated_by to match cris record
        updates_todo := updates_todo || format('%I = $1.%I', 'updated_by', 'updated_by');
        -- complete the update statement by joining all `set` clauses together
        update_stmt := update_stmt
            || array_to_string(updates_todo, ',')
            || format(' where public.crashes.id = %s', new.id);
        raise debug 'Updating crashes record from CRIS update';
        execute (update_stmt) using new;
    else
        raise debug 'No changes to unified record needed';
    end if;
    return null;
end;
$$;

create trigger update_crashes_from_crashes_cris_update
after update on public.crashes_cris for each row
execute procedure public.crashes_cris_update();
