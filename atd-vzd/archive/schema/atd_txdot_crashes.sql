--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:48:23 CDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 219 (class 1259 OID 2345633)
-- Name: atd_txdot_crashes; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_crashes (
    crash_id integer,
    crash_fatal_fl character varying(1),
    cmv_involv_fl character varying(1),
    schl_bus_fl character varying(1),
    rr_relat_fl character varying(1),
    medical_advisory_fl character varying(1),
    amend_supp_fl character varying(1),
    active_school_zone_fl character varying(1),
    crash_date date,
    crash_time time without time zone,
    case_id character varying(32),
    local_use character varying(32),
    rpt_cris_cnty_id integer,
    rpt_city_id integer,
    rpt_outside_city_limit_fl character varying(1),
    thousand_damage_fl character varying(1),
    rpt_latitude double precision,
    rpt_longitude double precision,
    rpt_rdwy_sys_id integer,
    rpt_hwy_num character varying(32),
    rpt_hwy_sfx character varying(32),
    rpt_road_part_id integer,
    rpt_block_num character varying(32),
    rpt_street_pfx character varying(32),
    rpt_street_name character varying(256),
    rpt_street_sfx character varying(32),
    private_dr_fl character varying(1),
    toll_road_fl character varying(1),
    crash_speed_limit integer,
    road_constr_zone_fl character varying(1),
    road_constr_zone_wrkr_fl character varying(1),
    rpt_street_desc character varying(256),
    at_intrsct_fl character varying(1),
    rpt_sec_rdwy_sys_id integer,
    rpt_sec_hwy_num character varying(32),
    rpt_sec_hwy_sfx character varying(25),
    rpt_sec_road_part_id integer,
    rpt_sec_block_num character varying(32),
    rpt_sec_street_pfx character varying(32),
    rpt_sec_street_name character varying(256),
    rpt_sec_street_sfx character varying(32),
    rpt_ref_mark_offset_amt double precision,
    rpt_ref_mark_dist_uom character varying(16),
    rpt_ref_mark_dir character varying(16),
    rpt_ref_mark_nbr character varying(32),
    rpt_sec_street_desc character varying(256),
    rpt_crossingnumber character varying(32),
    wthr_cond_id integer,
    light_cond_id integer,
    entr_road_id integer,
    road_type_id integer,
    road_algn_id integer,
    surf_cond_id integer,
    traffic_cntl_id integer,
    investigat_notify_time time without time zone,
    investigat_notify_meth character varying(32),
    investigat_arrv_time time without time zone,
    report_date date,
    investigat_comp_fl character varying(1),
    investigator_name character varying(128),
    id_number character varying(32),
    ori_number character varying(32),
    investigat_agency_id integer,
    investigat_area_id integer,
    investigat_district_id integer,
    investigat_region_id integer,
    bridge_detail_id integer,
    harm_evnt_id integer,
    intrsct_relat_id integer,
    fhe_collsn_id integer,
    obj_struck_id integer,
    othr_factr_id integer,
    road_part_adj_id integer,
    road_cls_id integer,
    road_relat_id integer,
    phys_featr_1_id integer,
    phys_featr_2_id integer,
    cnty_id integer,
    city_id integer,
    latitude double precision,
    longitude double precision,
    hwy_sys character varying(32),
    hwy_nbr character varying(32),
    hwy_sfx character varying(32),
    dfo double precision,
    street_name character varying(256),
    street_nbr character varying(32),
    control integer,
    section integer,
    milepoint double precision,
    ref_mark_nbr integer,
    ref_mark_displ double precision,
    hwy_sys_2 character varying(32),
    hwy_nbr_2 character varying(32),
    hwy_sfx_2 character varying(32),
    street_name_2 character varying(256),
    street_nbr_2 character varying(32),
    control_2 integer,
    section_2 integer,
    milepoint_2 double precision,
    txdot_rptable_fl character varying(1),
    onsys_fl character varying(1),
    rural_fl character varying(1),
    crash_sev_id integer,
    pop_group_id integer,
    located_fl character varying(1),
    day_of_week character varying(8),
    hwy_dsgn_lane_id character varying(25),
    hwy_dsgn_hrt_id character varying(25),
    hp_shldr_left character varying(25),
    hp_shldr_right character varying(25),
    hp_median_width character varying(25),
    base_type_id character varying(25),
    nbr_of_lane character varying(25),
    row_width_usual character varying(25),
    roadbed_width character varying(25),
    surf_width character varying(25),
    surf_type_id character varying(25),
    curb_type_left_id integer,
    curb_type_right_id integer,
    shldr_type_left_id integer,
    shldr_width_left integer,
    shldr_use_left_id integer,
    shldr_type_right_id integer,
    shldr_width_right integer,
    shldr_use_right_id integer,
    median_type_id integer,
    median_width integer,
    rural_urban_type_id integer,
    func_sys_id integer,
    adt_curnt_amt integer,
    adt_curnt_year integer,
    adt_adj_curnt_amt integer,
    pct_single_trk_adt double precision,
    pct_combo_trk_adt double precision,
    trk_aadt_pct double precision,
    curve_type_id integer,
    curve_lngth integer,
    cd_degr integer,
    delta_left_right_id integer,
    dd_degr integer,
    feature_crossed character varying(32),
    structure_number character varying(32),
    i_r_min_vert_clear character varying(32),
    approach_width character varying(32),
    bridge_median_id character varying(32),
    bridge_loading_type_id character varying(32),
    bridge_loading_in_1000_lbs character varying(32),
    bridge_srvc_type_on_id character varying(32),
    bridge_srvc_type_under_id character varying(32),
    culvert_type_id character varying(32),
    roadway_width character varying(32),
    deck_width character varying(32),
    bridge_dir_of_traffic_id character varying(32),
    bridge_rte_struct_func_id character varying(32),
    bridge_ir_struct_func_id character varying(32),
    crossingnumber character varying(32),
    rrco character varying(32),
    poscrossing_id character varying(32),
    wdcode_id character varying(32),
    standstop character varying(32),
    yield character varying(32),
    sus_serious_injry_cnt integer,
    nonincap_injry_cnt integer,
    poss_injry_cnt integer,
    non_injry_cnt integer,
    unkn_injry_cnt integer,
    tot_injry_cnt integer,
    death_cnt integer,
    mpo_id integer,
    investigat_service_id integer,
    investigat_da_id integer,
    investigator_narrative text,
    geocoded character varying(1) DEFAULT 'N'::character varying,
    geocode_status character varying(16) DEFAULT 'NA'::character varying NOT NULL,
    latitude_geocoded double precision,
    longitude_geocoded double precision,
    latitude_primary double precision,
    longitude_primary double precision,
    geocode_date timestamp without time zone,
    geocode_provider integer DEFAULT 0,
    qa_status integer DEFAULT 0 NOT NULL,
    last_update timestamp without time zone DEFAULT now(),
    approval_date timestamp without time zone,
    approved_by character varying(128),
    is_retired boolean DEFAULT false,
    updated_by character varying,
    address_confirmed_primary text,
    address_confirmed_secondary text,
    est_comp_cost numeric(10,2) DEFAULT 0.00,
    est_econ_cost numeric(10,2) DEFAULT 0.00,
    "position" public.geometry,
    apd_confirmed_fatality character varying(1) DEFAULT 'N'::character varying NOT NULL,
    apd_confirmed_death_count integer,
    micromobility_device_flag character varying(1) DEFAULT 'N'::character varying NOT NULL
);


ALTER TABLE public.atd_txdot_crashes OWNER TO atd_vz_data;

--
-- TOC entry 5627 (class 1259 OID 2348640)
-- Name: atd_txdot_crashes_apd_confirmed_fatality_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_apd_confirmed_fatality_index ON public.atd_txdot_crashes USING btree (apd_confirmed_fatality);


--
-- TOC entry 5628 (class 1259 OID 2346767)
-- Name: atd_txdot_crashes_geocode_provider_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_geocode_provider_index ON public.atd_txdot_crashes USING btree (geocode_provider);


--
-- TOC entry 5629 (class 1259 OID 2346768)
-- Name: atd_txdot_crashes_geocode_status_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_geocode_status_index ON public.atd_txdot_crashes USING btree (geocode_status);


--
-- TOC entry 5630 (class 1259 OID 2346769)
-- Name: atd_txdot_crashes_geocoded_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_geocoded_index ON public.atd_txdot_crashes USING btree (geocoded);


--
-- TOC entry 5631 (class 1259 OID 2346770)
-- Name: atd_txdot_crashes_is_retired_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_is_retired_index ON public.atd_txdot_crashes USING btree (is_retired);


--
-- TOC entry 5632 (class 1259 OID 2346771)
-- Name: atd_txdot_crashes_qa_status_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_qa_status_index ON public.atd_txdot_crashes USING btree (qa_status);


--
-- TOC entry 5633 (class 1259 OID 2346795)
-- Name: idx_atd_txdot_crashes_crash_id; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX idx_atd_txdot_crashes_crash_id ON public.atd_txdot_crashes USING btree (crash_id);


--
-- TOC entry 5634 (class 2620 OID 2346813)
-- Name: atd_txdot_crashes atd_txdot_crashes_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_crashes_audit_log BEFORE INSERT OR UPDATE ON public.atd_txdot_crashes FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_crashes_updates_audit_log();

ALTER TABLE public.atd_txdot_crashes DISABLE TRIGGER atd_txdot_crashes_audit_log;


-- Completed on 2019-10-15 13:48:26 CDT

--
-- PostgreSQL database dump complete
--

