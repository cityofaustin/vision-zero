--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:46:34 CDT

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
-- TOC entry 249 (class 1259 OID 2345874)
-- Name: atd_txdot_primaryperson; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_primaryperson (
    crash_id integer,
    unit_nbr integer,
    prsn_nbr integer,
    prsn_type_id integer,
    prsn_occpnt_pos_id integer,
    prsn_name_honorific character varying(32),
    prsn_injry_sev_id integer,
    prsn_age integer,
    prsn_ethnicity_id integer,
    prsn_gndr_id integer,
    prsn_ejct_id integer,
    prsn_rest_id integer,
    prsn_airbag_id integer,
    prsn_helmet_id integer,
    prsn_sol_fl character varying(1),
    prsn_alc_spec_type_id integer,
    prsn_alc_rslt_id integer,
    prsn_bac_test_rslt character varying(64),
    prsn_drg_spec_type_id integer,
    prsn_drg_rslt_id integer,
    drvr_drg_cat_1_id integer,
    prsn_taken_to character varying(256),
    prsn_taken_by character varying(256),
    prsn_death_date date,
    prsn_death_time time without time zone,
    sus_serious_injry_cnt integer,
    nonincap_injry_cnt integer,
    poss_injry_cnt integer,
    non_injry_cnt integer,
    unkn_injry_cnt integer,
    tot_injry_cnt integer,
    death_cnt integer,
    drvr_lic_type_id integer,
    drvr_lic_cls_id integer,
    drvr_city_name character varying(128),
    drvr_state_id integer,
    drvr_zip character varying(16),
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    primaryperson_id integer NOT NULL,
    is_retired boolean DEFAULT false,
    years_of_life_lost integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.atd_txdot_primaryperson OWNER TO atd_vz_data;

--
-- TOC entry 358 (class 1259 OID 2346259)
-- Name: atd_txdot_primaryperson_primaryperson_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_primaryperson_primaryperson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_primaryperson_primaryperson_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5783 (class 0 OID 0)
-- Dependencies: 358
-- Name: atd_txdot_primaryperson_primaryperson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_primaryperson_primaryperson_id_seq OWNED BY public.atd_txdot_primaryperson.primaryperson_id;


--
-- TOC entry 5620 (class 2604 OID 2346323)
-- Name: atd_txdot_primaryperson primaryperson_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_primaryperson ALTER COLUMN primaryperson_id SET DEFAULT nextval('public.atd_txdot_primaryperson_primaryperson_id_seq'::regclass);


--
-- TOC entry 5621 (class 1259 OID 2346777)
-- Name: atd_txdot_primaryperson_is_retired_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_is_retired_index ON public.atd_txdot_primaryperson USING btree (is_retired);


--
-- TOC entry 5622 (class 1259 OID 2346778)
-- Name: atd_txdot_primaryperson_primaryperson_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_primaryperson_id_index ON public.atd_txdot_primaryperson USING btree (primaryperson_id);


--
-- TOC entry 5623 (class 1259 OID 2346797)
-- Name: idx_atd_txdot_primaryperson_crash_id; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX idx_atd_txdot_primaryperson_crash_id ON public.atd_txdot_primaryperson USING btree (crash_id);


--
-- TOC entry 5624 (class 2620 OID 2346817)
-- Name: atd_txdot_primaryperson atd_txdot_primaryperson_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_primaryperson_audit_log BEFORE UPDATE ON public.atd_txdot_primaryperson FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_primaryperson_updates_audit_log();


-- Completed on 2019-10-15 13:46:38 CDT

--
-- PostgreSQL database dump complete
--

