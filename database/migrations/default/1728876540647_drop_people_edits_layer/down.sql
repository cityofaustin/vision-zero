CREATE TABLE public.change_log_people_edits (
    id integer NOT NULL,
    record_id integer NOT NULL,
    operation_type text NOT NULL,
    record_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by text NOT NULL
);


CREATE SEQUENCE public.change_log_people_edits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.change_log_people_edits_id_seq OWNED BY public.change_log_people_edits.id;


CREATE TABLE public.people_edits (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text DEFAULT 'system'::text NOT NULL,
    drvr_city_name text,
    drvr_drg_cat_1_id integer,
    drvr_zip text,
    ems_id integer,
    is_deleted boolean,
    is_primary_person boolean,
    prsn_age integer,
    prsn_alc_rslt_id integer,
    prsn_alc_spec_type_id integer,
    prsn_bac_test_rslt text,
    prsn_death_timestamp timestamp with time zone,
    prsn_drg_rslt_id integer,
    prsn_drg_spec_type_id integer,
    prsn_ethnicity_id integer,
    prsn_exp_homelessness boolean,
    prsn_first_name text,
    prsn_gndr_id integer,
    prsn_helmet_id integer,
    prsn_injry_sev_id integer,
    prsn_last_name text,
    prsn_mid_name text,
    prsn_name_sfx text,
    prsn_nbr integer,
    prsn_occpnt_pos_id integer,
    prsn_rest_id integer,
    prsn_taken_by text,
    prsn_taken_to text,
    prsn_type_id integer,
    unit_id integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text DEFAULT 'system'::text NOT NULL,
    drvr_lic_type_id integer
);

COMMENT ON COLUMN public.people_edits.drvr_lic_type_id IS 'Driver''s license type';

ALTER TABLE ONLY public.change_log_people_edits ALTER COLUMN id SET DEFAULT nextval('public.change_log_people_edits_id_seq'::regclass);


ALTER TABLE ONLY public.change_log_people_edits
    ADD CONSTRAINT change_log_people_edits_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT unique_people_edits UNIQUE (unit_id, prsn_nbr);


CREATE INDEX change_log_people_edits_record_id_idx ON public.change_log_people_edits USING btree (record_id);


CREATE TRIGGER insert_change_log_people_edits AFTER INSERT OR UPDATE ON public.people_edits FOR EACH ROW EXECUTE FUNCTION public.insert_change_log();


CREATE TRIGGER set_updated_at_timestamp_people_edits BEFORE UPDATE ON public.people_edits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();


CREATE TRIGGER update_people_from_people_edits_update AFTER UPDATE ON public.people_edits FOR EACH ROW EXECUTE FUNCTION public.people_edits_update();


ALTER TABLE ONLY public.change_log_people_edits
    ADD CONSTRAINT change_log_people_edits_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.people_edits(id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_drvr_drg_cat_1_id_fkey FOREIGN KEY (drvr_drg_cat_1_id) REFERENCES lookups.substnc_cat(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_drvr_lic_type_id_fkey FOREIGN KEY (drvr_lic_type_id) REFERENCES lookups.drvr_lic_type(id);


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_ems_id_fkey FOREIGN KEY (ems_id) REFERENCES public.ems__incidents(id) ON UPDATE CASCADE ON DELETE SET NULL;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_id_fkey FOREIGN KEY (id) REFERENCES public.people_cris(id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_alc_rslt_id_fkey FOREIGN KEY (prsn_alc_rslt_id) REFERENCES lookups.substnc_tst_result(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_alc_spec_type_id_fkey FOREIGN KEY (prsn_alc_spec_type_id) REFERENCES lookups.specimen_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_drg_rslt_id_fkey FOREIGN KEY (prsn_drg_rslt_id) REFERENCES lookups.substnc_tst_result(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_drg_spec_type_id_fkey FOREIGN KEY (prsn_drg_spec_type_id) REFERENCES lookups.specimen_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_ethnicity_id_fkey FOREIGN KEY (prsn_ethnicity_id) REFERENCES lookups.drvr_ethncty(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_gndr_id_fkey FOREIGN KEY (prsn_gndr_id) REFERENCES lookups.gndr(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_helmet_id_fkey FOREIGN KEY (prsn_helmet_id) REFERENCES lookups.helmet(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_injry_sev_id_fkey FOREIGN KEY (prsn_injry_sev_id) REFERENCES lookups.injry_sev(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_occpnt_pos_id_fkey FOREIGN KEY (prsn_occpnt_pos_id) REFERENCES lookups.occpnt_pos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_rest_id_fkey FOREIGN KEY (prsn_rest_id) REFERENCES lookups.rest(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_prsn_type_id_fkey FOREIGN KEY (prsn_type_id) REFERENCES lookups.prsn_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.people_edits
    ADD CONSTRAINT people_edits_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units_cris(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Have to recreate this function
drop function if exists public.people_cris_insert_rows cascade;


CREATE OR REPLACE FUNCTION public.people_cris_insert_rows()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- insert new combined / official record
    INSERT INTO public.people (
        created_by,
        drvr_city_name,
        drvr_drg_cat_1_id,
        drvr_lic_type_id,
        drvr_zip,
        id,
        is_deleted,
        is_primary_person,
        prsn_age,
        prsn_alc_rslt_id,
        prsn_alc_spec_type_id,
        prsn_bac_test_rslt,
        prsn_death_timestamp,
        prsn_drg_rslt_id,
        prsn_drg_spec_type_id,
        prsn_ethnicity_id,
        prsn_exp_homelessness,
        prsn_first_name,
        prsn_gndr_id,
        prsn_helmet_id,
        prsn_injry_sev_id,
        prsn_last_name,
        prsn_mid_name,
        prsn_name_sfx,
        prsn_nbr,
        prsn_occpnt_pos_id,
        prsn_rest_id,
        prsn_taken_by,
        prsn_taken_to,
        prsn_type_id,
        unit_id,
        updated_by
    ) values (
        new.created_by,
        new.drvr_city_name,
        new.drvr_drg_cat_1_id,
        new.drvr_lic_type_id,
        new.drvr_zip,
        new.id,
        new.is_deleted,
        new.is_primary_person,
        new.prsn_age,
        new.prsn_alc_rslt_id,
        new.prsn_alc_spec_type_id,
        new.prsn_bac_test_rslt,
        new.prsn_death_timestamp,
        new.prsn_drg_rslt_id,
        new.prsn_drg_spec_type_id,
        new.prsn_ethnicity_id,
        new.prsn_exp_homelessness,
        new.prsn_first_name,
        new.prsn_gndr_id,
        new.prsn_helmet_id,
        new.prsn_injry_sev_id,
        new.prsn_last_name,
        new.prsn_mid_name,
        new.prsn_name_sfx,
        new.prsn_nbr,
        new.prsn_occpnt_pos_id,
        new.prsn_rest_id,
        new.prsn_taken_by,
        new.prsn_taken_to,
        new.prsn_type_id,
        new.unit_id,
        new.updated_by
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO public.people_edits (id) values (new.id);

    RETURN NULL;
END;
$function$
;


-- Have to recreate this trigger
create trigger insert_new_people_cris after
insert
    on
    public.people_cris for each row execute function people_cris_insert_rows();


-- Have to recreate this function
drop function if exists public.people_cris_update cascade;


CREATE OR REPLACE FUNCTION public.people_cris_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    new_cris_jb jsonb := to_jsonb (new);
    old_cris_jb jsonb := to_jsonb (old);
    edit_record_jb jsonb;
    column_name text;
    updates_todo text [] := '{}';
    update_stmt text := 'update public.people set ';
begin
    -- get corresponding the VZ record as jsonb
    SELECT to_jsonb(people_edits) INTO edit_record_jb from public.people_edits where public.people_edits.id = new.id;

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
            || format(' where public.people.id = %s', new.id);
        raise debug 'Updating people record from CRIS update';
        execute (update_stmt) using new;
    else
        raise debug 'No changes to unified record needed';
    end if;
    return null;
end;
$function$
;


-- Adding this trigger back
create trigger update_people_from_people_cris_update after
update
    on
    public.people_cris for each row execute function people_cris_update();
    