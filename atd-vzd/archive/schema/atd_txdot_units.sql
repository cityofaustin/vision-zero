--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:46:02 CDT

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
-- TOC entry 251 (class 1259 OID 2345899)
-- Name: atd_txdot_units; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_units (
    crash_id integer,
    unit_nbr integer,
    unit_desc_id integer,
    veh_parked_fl character varying(1),
    veh_hnr_fl character varying(1),
    veh_lic_state_id integer,
    veh_lic_plate_nbr character varying(64),
    vin character varying(128),
    veh_mod_year integer,
    veh_color_id integer,
    veh_make_id integer,
    veh_mod_id integer,
    veh_body_styl_id integer,
    emer_respndr_fl character varying(1),
    owner_lessee character varying(32),
    ownr_mid_name character varying(128),
    ownr_name_sfx character varying(32),
    ownr_name_honorific character varying(32),
    ownr_city_name character varying(128),
    ownr_state_id integer,
    ownr_zip character varying(16),
    fin_resp_proof_id integer,
    fin_resp_type_id integer,
    fin_resp_name character varying(128),
    fin_resp_policy_nbr character varying(128),
    fin_resp_phone_nbr character varying(128),
    veh_dmag_area_1_id integer,
    veh_dmag_scl_1_id integer,
    force_dir_1_id integer,
    veh_dmag_area_2_id integer,
    veh_dmag_scl_2_id integer,
    force_dir_2_id integer,
    veh_inventoried_fl character varying(1),
    veh_transp_name character varying(128),
    veh_transp_dest character varying(256),
    veh_cmv_fl character varying(1),
    cmv_fiveton_fl character varying(32),
    cmv_hazmat_fl character varying(32),
    cmv_nine_plus_pass_fl character varying(32),
    cmv_veh_oper_id integer,
    cmv_carrier_id_type_id integer,
    cmv_carrier_id_nbr text,
    cmv_carrier_corp_name character varying(64),
    cmv_carrier_street_pfx character varying(64),
    cmv_carrier_street_nbr character varying(64),
    cmv_carrier_street_name character varying(128),
    cmv_carrier_street_sfx character varying(32),
    cmv_carrier_po_box character varying(128),
    cmv_carrier_city_name character varying(128),
    cmv_carrier_state_id integer,
    cmv_carrier_zip character varying(16),
    cmv_road_acc_id integer,
    cmv_veh_type_id integer,
    cmv_gvwr text,
    cmv_rgvw character varying(64),
    cmv_hazmat_rel_fl character varying(64),
    hazmat_cls_1_id integer,
    hazmat_idnbr_1_id integer,
    hazmat_cls_2_id integer,
    hazmat_idnbr_2_id integer,
    cmv_cargo_body_id integer,
    trlr1_gvwr character varying(64),
    trlr1_rgvw character varying(64),
    trlr1_type_id integer,
    trlr2_gvwr character varying(64),
    trlr2_rgvw character varying(64),
    trlr2_type_id integer,
    cmv_evnt1_id integer,
    cmv_evnt2_id integer,
    cmv_evnt3_id integer,
    cmv_evnt4_id integer,
    cmv_tot_axle character varying(64),
    cmv_tot_tire character varying(64),
    contrib_factr_1_id integer,
    contrib_factr_2_id integer,
    contrib_factr_3_id integer,
    contrib_factr_p1_id integer,
    contrib_factr_p2_id integer,
    veh_dfct_1_id integer,
    veh_dfct_2_id integer,
    veh_dfct_3_id integer,
    veh_dfct_p1_id integer,
    veh_dfct_p2_id integer,
    veh_trvl_dir_id integer,
    first_harm_evt_inv_id integer,
    sus_serious_injry_cnt character varying(16),
    nonincap_injry_cnt character varying(16),
    poss_injry_cnt character varying(16),
    non_injry_cnt character varying(16),
    unkn_injry_cnt character varying(16),
    tot_injry_cnt character varying(16),
    death_cnt character varying(16),
    cmv_disabling_damage_fl character varying(64),
    cmv_trlr1_disabling_dmag_id integer,
    cmv_trlr2_disabling_dmag_id integer,
    cmv_bus_type_id integer,
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    unit_id integer NOT NULL,
    is_retired boolean DEFAULT false
);


ALTER TABLE public.atd_txdot_units OWNER TO atd_vz_data;

--
-- TOC entry 359 (class 1259 OID 2346261)
-- Name: atd_txdot_units_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_units_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_units_unit_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5781 (class 0 OID 0)
-- Dependencies: 359
-- Name: atd_txdot_units_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_units_unit_id_seq OWNED BY public.atd_txdot_units.unit_id;


--
-- TOC entry 5619 (class 2604 OID 2346324)
-- Name: atd_txdot_units unit_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_units ALTER COLUMN unit_id SET DEFAULT nextval('public.atd_txdot_units_unit_id_seq'::regclass);


--
-- TOC entry 5620 (class 1259 OID 2346782)
-- Name: atd_txdot_units_unit_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_unit_id_index ON public.atd_txdot_units USING btree (unit_id);


--
-- TOC entry 5621 (class 1259 OID 2346798)
-- Name: idx_atd_txdot_units_crash_id; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX idx_atd_txdot_units_crash_id ON public.atd_txdot_units USING btree (crash_id);


--
-- TOC entry 5622 (class 2620 OID 2346818)
-- Name: atd_txdot_units atd_txdot_units_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_units_audit_log BEFORE UPDATE ON public.atd_txdot_units FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_units_updates_audit_log();


-- Completed on 2019-10-15 13:46:10 CDT

--
-- PostgreSQL database dump complete
--

