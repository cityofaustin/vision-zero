CREATE TABLE public.change_log_crashes_edits (
    id integer NOT NULL,
    record_id integer NOT NULL,
    operation_type text NOT NULL,
    record_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by text NOT NULL
);


CREATE SEQUENCE public.change_log_crashes_edits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.change_log_crashes_edits_id_seq OWNED BY public.change_log_crashes_edits.id;


CREATE TABLE public.crashes_edits (
    id integer NOT NULL,
    active_school_zone_fl boolean,
    at_intrsct_fl boolean,
    case_id text,
    cr3_processed_at timestamp with time zone,
    cr3_stored_fl boolean,
    crash_speed_limit integer,
    crash_timestamp timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text DEFAULT 'system'::text NOT NULL,
    cris_crash_id integer,
    fhe_collsn_id integer,
    intrsct_relat_id integer,
    investigat_agency_id integer,
    investigator_narrative text,
    is_deleted boolean,
    is_temp_record boolean,
    latitude numeric,
    law_enforcement_ytd_fatality_num text,
    light_cond_id integer,
    longitude numeric,
    medical_advisory_fl boolean,
    obj_struck_id integer,
    onsys_fl boolean,
    private_dr_fl boolean,
    road_constr_zone_fl boolean,
    road_constr_zone_wrkr_fl boolean,
    rpt_block_num text,
    rpt_city_id integer,
    rpt_cris_cnty_id integer,
    rpt_hwy_num text,
    rpt_hwy_sfx text,
    rpt_rdwy_sys_id integer,
    rpt_ref_mark_dir text,
    rpt_ref_mark_dist_uom text,
    rpt_ref_mark_nbr text,
    rpt_ref_mark_offset_amt numeric,
    rpt_road_part_id integer,
    rpt_sec_block_num text,
    rpt_sec_hwy_num text,
    rpt_sec_hwy_sfx text,
    rpt_sec_rdwy_sys_id integer,
    rpt_sec_road_part_id integer,
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
    surf_cond_id integer,
    surf_type_id integer,
    thousand_damage_fl boolean,
    toll_road_fl boolean,
    traffic_cntl_id integer,
    txdot_rptable_fl boolean,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by text DEFAULT 'system'::text NOT NULL,
    wthr_cond_id integer,
    investigator_narrative_ocr_processed_at timestamp with time zone
);


COMMENT ON COLUMN public.crashes_edits.investigator_narrative_ocr_processed_at IS 'The most recent
timestamp at which the OCR process attempted to extract the investigator narrative. If null, 
indicates that the OCR narrative extract has never been attempted. This value should be set
via ETL process.';


ALTER TABLE ONLY public.change_log_crashes_edits ALTER COLUMN id SET DEFAULT nextval('public.change_log_crashes_edits_id_seq'::regclass);


ALTER TABLE ONLY public.change_log_crashes_edits
    ADD CONSTRAINT change_log_crashes_edits_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_cris_crash_id_key UNIQUE (cris_crash_id);


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_pkey PRIMARY KEY (id);


CREATE INDEX change_log_crashes_edits_record_id_idx ON public.change_log_crashes_edits USING btree (record_id);


CREATE TRIGGER insert_change_log_crashes_edits AFTER INSERT OR UPDATE ON public.crashes_edits FOR EACH ROW EXECUTE FUNCTION public.insert_change_log();


CREATE TRIGGER set_updated_at_timestamp_crashes_edits BEFORE UPDATE ON public.crashes_edits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Have to recreate this function
drop function if exists public.crashes_cris_insert_rows cascade;

CREATE FUNCTION public.crashes_cris_insert_rows() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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

-- Have to recreate this trigger
create or replace trigger insert_new_crashes_cris
after insert on public.crashes_cris
for each row
execute procedure public.crashes_cris_insert_rows();

-- Have to recreate this function
drop function if exists public.crashes_cris_update cascade;

CREATE FUNCTION public.crashes_cris_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
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
$_$;


-- Adding this trigger back
create trigger update_crashes_from_crashes_cris_update
after update on public.crashes_cris for each row
execute procedure public.crashes_cris_update();


CREATE TRIGGER update_crashes_from_crashes_edits_update AFTER UPDATE ON public.crashes_edits FOR EACH ROW EXECUTE FUNCTION public.crashes_edits_update();


ALTER TABLE ONLY public.change_log_crashes_edits
    ADD CONSTRAINT change_log_crashes_edits_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.crashes_edits(id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_fhe_collsn_id_fkey FOREIGN KEY (fhe_collsn_id) REFERENCES lookups.collsn(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_id_fkey FOREIGN KEY (id) REFERENCES public.crashes_cris(id) ON UPDATE CASCADE ON DELETE CASCADE;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_intrsct_relat_id_fkey FOREIGN KEY (intrsct_relat_id) REFERENCES lookups.intrsct_relat(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_investigat_agency_id_fkey FOREIGN KEY (investigat_agency_id) REFERENCES lookups.agency(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_light_cond_id_fkey FOREIGN KEY (light_cond_id) REFERENCES lookups.light_cond(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_obj_struck_id_fkey FOREIGN KEY (obj_struck_id) REFERENCES lookups.obj_struck(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_rpt_city_id_fkey FOREIGN KEY (rpt_city_id) REFERENCES lookups.city(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_rpt_cris_cnty_id_fkey FOREIGN KEY (rpt_cris_cnty_id) REFERENCES lookups.cnty(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_rpt_rdwy_sys_id_fkey FOREIGN KEY (rpt_rdwy_sys_id) REFERENCES lookups.rwy_sys(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_rpt_road_part_id_fkey FOREIGN KEY (rpt_road_part_id) REFERENCES lookups.road_part(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_rpt_sec_rdwy_sys_id_fkey FOREIGN KEY (rpt_sec_rdwy_sys_id) REFERENCES lookups.rwy_sys(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_rpt_sec_road_part_id_fkey FOREIGN KEY (rpt_sec_road_part_id) REFERENCES lookups.road_part(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_surf_cond_id_fkey FOREIGN KEY (surf_cond_id) REFERENCES lookups.surf_cond(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_surf_type_id_fkey FOREIGN KEY (surf_type_id) REFERENCES lookups.surf_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_traffic_cntl_id_fkey FOREIGN KEY (traffic_cntl_id) REFERENCES lookups.traffic_cntl(id) ON UPDATE CASCADE ON DELETE RESTRICT;


ALTER TABLE ONLY public.crashes_edits
    ADD CONSTRAINT crashes_edits_wthr_cond_id_fkey FOREIGN KEY (wthr_cond_id) REFERENCES lookups.wthr_cond(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Recreating these views

CREATE OR REPLACE VIEW public.crashes_list_view
AS WITH geocode_status AS- public.locations_list_view source

CREATE OR REPLACE VIEW public.locations_list_view
AS WITH cr3_comp_costs AS (
         SELECT crashes_list_view.location_id,
            sum(crashes_list_view.est_comp_cost_crash_based) AS cr3_comp_costs_total
           FROM crashes_list_view
          WHERE crashes_list_view.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes_list_view.location_id
        ), cr3_crash_counts AS (
         SELECT crashes.location_id,
            count(crashes.location_id) AS crash_count
           FROM crashes
          WHERE crashes.private_dr_fl = false AND crashes.location_id IS NOT NULL AND crashes.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes.location_id
        ), non_cr3_crash_counts AS (
         SELECT atd_apd_blueform.location_id,
            count(atd_apd_blueform.location_id) AS crash_count,
            count(atd_apd_blueform.location_id) * 10000 AS noncr3_comp_costs_total
           FROM atd_apd_blueform
          WHERE atd_apd_blueform.location_id IS NOT NULL AND atd_apd_blueform.date > (now() - '5 years'::interval)
          GROUP BY atd_apd_blueform.location_id
        )
 SELECT locations.location_id,
    locations.description,
    locations.council_district,
    locations.location_group,
    COALESCE(cr3_comp_costs.cr3_comp_costs_total + non_cr3_crash_counts.noncr3_comp_costs_total, 0::bigint) AS total_est_comp_cost,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) AS cr3_crash_count,
    COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS non_cr3_crash_count,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) + COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS crash_count
   FROM atd_txdot_locations locations
     LEFT JOIN cr3_crash_counts ON locations.location_id::text = cr3_crash_counts.location_id
     LEFT JOIN non_cr3_crash_counts ON locations.location_id::text = non_cr3_crash_counts.location_id::text
     LEFT JOIN cr3_comp_costs ON locations.location_id::text = cr3_comp_costs.location_id; (
         SELECT cris.id,
            edits.latitude IS NOT NULL OR edits.longitude IS NOT NULL AS is_manual_geocode
           FROM crashes_cris cris
             LEFT JOIN crashes_edits edits ON cris.id = edits.id
        )
 SELECT crashes.id,
    crashes.cris_crash_id,
    crashes.record_locator,
    crashes.case_id,
    crashes.crash_timestamp,
    crashes.address_primary,
    crashes.address_secondary,
    crashes.private_dr_fl,
    crashes.in_austin_full_purpose,
    crashes.location_id,
    crashes.rpt_block_num,
    crashes.rpt_street_pfx,
    crashes.rpt_street_sfx,
    crashes.rpt_street_name,
    crashes.rpt_sec_block_num,
    crashes.rpt_sec_street_pfx,
    crashes.rpt_sec_street_sfx,
    crashes.rpt_sec_street_name,
    crashes.latitude,
    crashes.longitude,
    crashes.light_cond_id,
    crashes.wthr_cond_id,
    crashes.active_school_zone_fl,
    crashes.schl_bus_fl,
    crashes.at_intrsct_fl,
    crashes.onsys_fl,
    crashes.traffic_cntl_id,
    crashes.road_constr_zone_fl,
    crashes.rr_relat_fl,
    crashes.toll_road_fl,
    crashes.intrsct_relat_id,
    crashes.obj_struck_id,
    crashes.crash_speed_limit,
    crashes.council_district,
    crashes.is_temp_record,
    crash_injury_metrics_view.nonincap_injry_count,
    crash_injury_metrics_view.poss_injry_count,
    crash_injury_metrics_view.sus_serious_injry_count,
    crash_injury_metrics_view.non_injry_count,
    crash_injury_metrics_view.tot_injry_count,
    crash_injury_metrics_view.vz_fatality_count,
    crash_injury_metrics_view.cris_fatality_count,
    crash_injury_metrics_view.law_enf_fatality_count,
    crash_injury_metrics_view.fatality_count,
    crash_injury_metrics_view.unkn_injry_count,
    crash_injury_metrics_view.est_comp_cost_crash_based,
    crash_injury_metrics_view.crash_injry_sev_id,
    crash_injury_metrics_view.years_of_life_lost,
    injry_sev.label AS crash_injry_sev_desc,
    collsn.label AS collsn_desc,
    geocode_status.is_manual_geocode,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD'::text) AS crash_date_ct,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'HH24:MI:SS'::text) AS crash_time_ct,
    upper(to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'dy'::text)) AS crash_day_of_week
   FROM crashes
     LEFT JOIN LATERAL ( SELECT crash_injury_metrics_view_1.id,
            crash_injury_metrics_view_1.cris_crash_id,
            crash_injury_metrics_view_1.unkn_injry_count,
            crash_injury_metrics_view_1.nonincap_injry_count,
            crash_injury_metrics_view_1.poss_injry_count,
            crash_injury_metrics_view_1.non_injry_count,
            crash_injury_metrics_view_1.sus_serious_injry_count,
            crash_injury_metrics_view_1.tot_injry_count,
            crash_injury_metrics_view_1.fatality_count,
            crash_injury_metrics_view_1.vz_fatality_count,
            crash_injury_metrics_view_1.law_enf_fatality_count,
            crash_injury_metrics_view_1.cris_fatality_count,
            crash_injury_metrics_view_1.motor_vehicle_fatality_count,
            crash_injury_metrics_view_1.motor_vehicle_sus_serious_injry_count,
            crash_injury_metrics_view_1.motorcycle_fatality_count,
            crash_injury_metrics_view_1.motorcycle_sus_serious_count,
            crash_injury_metrics_view_1.bicycle_fatality_count,
            crash_injury_metrics_view_1.bicycle_sus_serious_injry_count,
            crash_injury_metrics_view_1.pedestrian_fatality_count,
            crash_injury_metrics_view_1.pedestrian_sus_serious_injry_count,
            crash_injury_metrics_view_1.micromobility_fatality_count,
            crash_injury_metrics_view_1.micromobility_sus_serious_injry_count,
            crash_injury_metrics_view_1.other_fatality_count,
            crash_injury_metrics_view_1.other_sus_serious_injry_count,
            crash_injury_metrics_view_1.crash_injry_sev_id,
            crash_injury_metrics_view_1.years_of_life_lost,
            crash_injury_metrics_view_1.est_comp_cost_crash_based,
            crash_injury_metrics_view_1.est_total_person_comp_cost
           FROM crash_injury_metrics_view crash_injury_metrics_view_1
          WHERE crashes.id = crash_injury_metrics_view_1.id
         LIMIT 1) crash_injury_metrics_view ON true
     LEFT JOIN geocode_status ON crashes.id = geocode_status.id
     LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
     LEFT JOIN lookups.injry_sev ON crash_injury_metrics_view.crash_injry_sev_id = injry_sev.id
  WHERE crashes.is_deleted = false
  ORDER BY crashes.crash_timestamp DESC;


CREATE OR REPLACE VIEW public.locations_list_view
AS WITH cr3_comp_costs AS (
         SELECT crashes_list_view.location_id,
            sum(crashes_list_view.est_comp_cost_crash_based) AS cr3_comp_costs_total
           FROM crashes_list_view
          WHERE crashes_list_view.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes_list_view.location_id
        ), cr3_crash_counts AS (
         SELECT crashes.location_id,
            count(crashes.location_id) AS crash_count
           FROM crashes
          WHERE crashes.private_dr_fl = false AND crashes.location_id IS NOT NULL AND crashes.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes.location_id
        ), non_cr3_crash_counts AS (
         SELECT atd_apd_blueform.location_id,
            count(atd_apd_blueform.location_id) AS crash_count,
            count(atd_apd_blueform.location_id) * 10000 AS noncr3_comp_costs_total
           FROM atd_apd_blueform
          WHERE atd_apd_blueform.location_id IS NOT NULL AND atd_apd_blueform.date > (now() - '5 years'::interval)
          GROUP BY atd_apd_blueform.location_id
        )
 SELECT locations.location_id,
    locations.description,
    locations.council_district,
    locations.location_group,
    COALESCE(cr3_comp_costs.cr3_comp_costs_total + non_cr3_crash_counts.noncr3_comp_costs_total, 0::bigint) AS total_est_comp_cost,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) AS cr3_crash_count,
    COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS non_cr3_crash_count,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) + COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS crash_count
   FROM atd_txdot_locations locations
     LEFT JOIN cr3_crash_counts ON locations.location_id::text = cr3_crash_counts.location_id
     LEFT JOIN non_cr3_crash_counts ON locations.location_id::text = non_cr3_crash_counts.location_id::text
     LEFT JOIN cr3_comp_costs ON locations.location_id::text = cr3_comp_costs.location_id;
     