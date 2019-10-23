--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:48:56 CDT

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
-- TOC entry 244 (class 1259 OID 2345798)
-- Name: atd_txdot_charges; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_charges (
    charge_id integer NOT NULL,
    crash_id integer DEFAULT 0 NOT NULL,
    unit_nbr integer DEFAULT 0 NOT NULL,
    prsn_nbr integer DEFAULT 0 NOT NULL,
    charge_cat_id integer DEFAULT 0 NOT NULL,
    charge text DEFAULT ''::text NOT NULL,
    citation_nbr character varying(32) DEFAULT ''::character varying NOT NULL,
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    is_retired boolean DEFAULT false NOT NULL
);


ALTER TABLE public.atd_txdot_charges OWNER TO atd_vz_data;

--
-- TOC entry 350 (class 1259 OID 2346229)
-- Name: atd_txdot_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_charges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_charges_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5791 (class 0 OID 0)
-- Dependencies: 350
-- Name: atd_txdot_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_charges_id_seq OWNED BY public.atd_txdot_charges.charge_id;


--
-- TOC entry 5625 (class 2604 OID 2346317)
-- Name: atd_txdot_charges charge_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges ALTER COLUMN charge_id SET DEFAULT nextval('public.atd_txdot_charges_id_seq'::regclass);


--
-- TOC entry 5627 (class 2606 OID 2346714)
-- Name: atd_txdot_charges atd_txdot_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges
    ADD CONSTRAINT atd_txdot_charges_pkey PRIMARY KEY (charge_id);


--
-- TOC entry 5629 (class 2606 OID 2346716)
-- Name: atd_txdot_charges atd_txdot_charges_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges
    ADD CONSTRAINT atd_txdot_charges_unique_id_key UNIQUE (charge_id);


--
-- TOC entry 5631 (class 2606 OID 2346746)
-- Name: atd_txdot_charges uniq_atd_txdot_charges; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges
    ADD CONSTRAINT uniq_atd_txdot_charges UNIQUE (crash_id, unit_nbr, prsn_nbr, charge_cat_id, charge, citation_nbr);


--
-- TOC entry 5632 (class 2620 OID 2346812)
-- Name: atd_txdot_charges atd_txdot_charges_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_charges_audit_log BEFORE UPDATE ON public.atd_txdot_charges FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_charges_updates_audit_log();


-- Completed on 2019-10-15 13:49:00 CDT

--
-- PostgreSQL database dump complete
--

