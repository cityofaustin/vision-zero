CREATE TABLE public.change_log_units_edits (
    id integer NOT NULL,
    record_id integer NOT NULL,
    operation_type text NOT NULL,
    record_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by text NOT NULL
);


CREATE SEQUENCE public.change_log_units_edits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.change_log_units_edits_id_seq OWNED BY public.change_log_units_edits.id;


CREATE TABLE public.units_edits (
    id integer NOT NULL,
    autonomous_unit_id integer,
    contrib_factr_1_id integer,
    contrib_factr_2_id integer,
    contrib_factr_3_id integer,
    contrib_factr_p1_id integer,
    contrib_factr_p2_id integer,
    crash_pk integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text DEFAULT 'system'::text NOT NULL,
    cris_crash_id integer,
    e_scooter_id integer,
    first_harm_evt_inv_id integer,
    is_deleted boolean,
    movement_id integer,
    pbcat_pedalcyclist_id integer,
    pbcat_pedestrian_id integer,
    pedalcyclist_action_id integer,
    pedestrian_action_id integer,
    rpt_autonomous_level_engaged_id integer,
    unit_desc_id integer,
    unit_nbr integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text DEFAULT 'system'::text NOT NULL,
    veh_body_styl_id integer,
    veh_damage_description1_id integer,
    veh_damage_description2_id integer,
    veh_damage_direction_of_force1_id integer,
    veh_damage_direction_of_force2_id integer,
    veh_damage_severity1_id integer,
    veh_damage_severity2_id integer,
    veh_make_id integer,
    veh_mod_id integer,
    veh_mod_year integer,
    veh_trvl_dir_id integer,
    vin text,
    veh_hnr_fl boolean
);

COMMENT ON COLUMN public.units_edits.veh_hnr_fl IS 'If the unit was involved in a hit-and-run crash. This field may indicate that the unit was the victim of a hit and run, or this unit left the scene/committed the hit and run';


ALTER TABLE ONLY public.change_log_units_edits ALTER COLUMN id SET DEFAULT nextval('public.change_log_units_edits_id_seq'::regclass);


ALTER TABLE ONLY public.change_log_units_edits
    ADD CONSTRAINT change_log_units_edits_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_pkey PRIMARY KEY (id);


CREATE INDEX change_log_units_edits_record_id_idx ON public.change_log_units_edits USING btree (record_id);


CREATE TRIGGER insert_change_log_units_edits AFTER INSERT OR UPDATE ON public.units_edits FOR EACH ROW EXECUTE FUNCTION public.insert_change_log();


CREATE TRIGGER set_updated_at_timestamp_units_edits BEFORE UPDATE ON public.units_edits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();


CREATE TRIGGER update_units_from_units_edits_update AFTER UPDATE ON public.units_edits FOR EACH ROW EXECUTE FUNCTION public.units_edits_update();


ALTER TABLE ONLY public.change_log_units_edits
    ADD CONSTRAINT change_log_units_edits_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.units_edits(id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_autonomous_unit_id_fkey FOREIGN KEY (autonomous_unit_id) REFERENCES lookups.autonomous_unit(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_contrib_factr_1_id_fkey FOREIGN KEY (contrib_factr_1_id) REFERENCES lookups.contrib_factr(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_contrib_factr_2_id_fkey FOREIGN KEY (contrib_factr_2_id) REFERENCES lookups.contrib_factr(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_contrib_factr_3_id_fkey FOREIGN KEY (contrib_factr_3_id) REFERENCES lookups.contrib_factr(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_contrib_factr_p1_id_fkey FOREIGN KEY (contrib_factr_p1_id) REFERENCES lookups.contrib_factr(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_contrib_factr_p2_id_fkey FOREIGN KEY (contrib_factr_p2_id) REFERENCES lookups.contrib_factr(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_crash_pk_fkey FOREIGN KEY (crash_pk) REFERENCES public.crashes_cris(id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_cris_crash_id_fkey FOREIGN KEY (cris_crash_id) REFERENCES public.crashes_cris(cris_crash_id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_e_scooter_id_fkey FOREIGN KEY (e_scooter_id) REFERENCES lookups.e_scooter(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_first_harm_evt_inv_id_fkey FOREIGN KEY (first_harm_evt_inv_id) REFERENCES lookups.harm_evnt(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_id_fkey FOREIGN KEY (id) REFERENCES public.units_cris(id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_movement_id_fkey FOREIGN KEY (movement_id) REFERENCES lookups.movt(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_pbcat_pedalcyclist_id_fkey FOREIGN KEY (pbcat_pedalcyclist_id) REFERENCES lookups.pbcat_pedalcyclist(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_pbcat_pedestrian_id_fkey FOREIGN KEY (pbcat_pedestrian_id) REFERENCES lookups.pbcat_pedestrian(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_pedalcyclist_action_id_fkey FOREIGN KEY (pedalcyclist_action_id) REFERENCES lookups.pedalcyclist_action(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_pedestrian_action_id_fkey FOREIGN KEY (pedestrian_action_id) REFERENCES lookups.pedestrian_action(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_rpt_autonomous_level_engaged_id_fkey FOREIGN KEY (rpt_autonomous_level_engaged_id) REFERENCES lookups.autonomous_level_engaged(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_unit_desc_id_fkey FOREIGN KEY (unit_desc_id) REFERENCES lookups.unit_desc(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_body_styl_id_fkey FOREIGN KEY (veh_body_styl_id) REFERENCES lookups.veh_body_styl(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_damage_description1_id_fkey FOREIGN KEY (veh_damage_description1_id) REFERENCES lookups.veh_damage_description(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_damage_description2_id_fkey FOREIGN KEY (veh_damage_description2_id) REFERENCES lookups.veh_damage_description(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_damage_direction_of_force1_id_fkey FOREIGN KEY (veh_damage_direction_of_force1_id) REFERENCES lookups.veh_direction_of_force(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_damage_direction_of_force2_id_fkey FOREIGN KEY (veh_damage_direction_of_force2_id) REFERENCES lookups.veh_direction_of_force(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_damage_severity1_id_fkey FOREIGN KEY (veh_damage_severity1_id) REFERENCES lookups.veh_damage_severity(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_damage_severity2_id_fkey FOREIGN KEY (veh_damage_severity2_id) REFERENCES lookups.veh_damage_severity(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_make_id_fkey FOREIGN KEY (veh_make_id) REFERENCES lookups.veh_make(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_mod_id_fkey FOREIGN KEY (veh_mod_id) REFERENCES lookups.veh_mod(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.units_edits
    ADD CONSTRAINT units_edits_veh_trvl_dir_id_fkey FOREIGN KEY (veh_trvl_dir_id) REFERENCES lookups.trvl_dir(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- Have to recreate this function
drop function if exists public.units_cris_insert_rows cascade;


CREATE OR REPLACE FUNCTION public.units_cris_insert_rows()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- insert new combined / official record
    INSERT INTO public.units (
        autonomous_unit_id,
        contrib_factr_1_id,
        contrib_factr_2_id,
        contrib_factr_3_id,
        contrib_factr_p1_id,
        contrib_factr_p2_id,
        crash_pk,
        created_by,
        cris_crash_id,
        e_scooter_id,
        first_harm_evt_inv_id,
        id,
        is_deleted,
        pbcat_pedalcyclist_id,
        pbcat_pedestrian_id,
        pedalcyclist_action_id,
        pedestrian_action_id,
        rpt_autonomous_level_engaged_id,
        unit_desc_id,
        unit_nbr,
        updated_by,
        veh_body_styl_id,
        veh_damage_description1_id,
        veh_damage_description2_id,
        veh_damage_direction_of_force1_id,
        veh_damage_direction_of_force2_id,
        veh_damage_severity1_id,
        veh_damage_severity2_id,
        veh_hnr_fl,
        veh_make_id,
        veh_mod_id,
        veh_mod_year,
        veh_trvl_dir_id,
        vin
    ) values (
        new.autonomous_unit_id,
        new.contrib_factr_1_id,
        new.contrib_factr_2_id,
        new.contrib_factr_3_id,
        new.contrib_factr_p1_id,
        new.contrib_factr_p2_id,
        new.crash_pk,
        new.created_by,
        new.cris_crash_id,
        new.e_scooter_id,
        new.first_harm_evt_inv_id,
        new.id,
        new.is_deleted,
        new.pbcat_pedalcyclist_id,
        new.pbcat_pedestrian_id,
        new.pedalcyclist_action_id,
        new.pedestrian_action_id,
        new.rpt_autonomous_level_engaged_id,
        new.unit_desc_id,
        new.unit_nbr,
        new.updated_by,
        new.veh_body_styl_id,
        new.veh_damage_description1_id,
        new.veh_damage_description2_id,
        new.veh_damage_direction_of_force1_id,
        new.veh_damage_direction_of_force2_id,
        new.veh_damage_severity1_id,
        new.veh_damage_severity2_id,
        new.veh_hnr_fl,
        new.veh_make_id,
        new.veh_mod_id,
        new.veh_mod_year,
        new.veh_trvl_dir_id,
        new.vin
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO public.units_edits (id) values (new.id);

    RETURN NULL;
END;
$function$
;


-- Have to recreate this trigger
create trigger insert_new_units_cris after
insert
    on
    public.units_cris for each row execute function units_cris_insert_rows();


-- Have to recreate this function
drop function if exists public.units_cris_update cascade;


CREATE OR REPLACE FUNCTION public.units_cris_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    new_cris_jb jsonb := to_jsonb (new);
    old_cris_jb jsonb := to_jsonb (old);
    edit_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update public.units set ';
begin
    -- get corresponding the VZ record as jsonb
    SELECT to_jsonb(units_edits) INTO edit_record_jb from public.units_edits where public.units_edits.id = new.id;

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
            || format(' where public.units.id = %s', new.id);
        raise debug 'Updating units record from CRIS update';
        execute (update_stmt) using new;
    else
        raise debug 'No changes to unified record needed';
    end if;
    return null;
end;
$function$
;


-- Adding this trigger back
create trigger update_units_from_units_cris_update after
update
    on
    public.units_cris for each row execute function units_cris_update();
