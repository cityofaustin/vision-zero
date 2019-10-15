--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:49:12 CDT

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
-- TOC entry 245 (class 1259 OID 2345816)
-- Name: atd_txdot_crash_locations; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_crash_locations (
    crash_location_id integer NOT NULL,
    crash_id integer NOT NULL,
    location_id character varying(32) NOT NULL,
    metadata json,
    comments text,
    last_update date DEFAULT now(),
    is_retired boolean DEFAULT false
);


ALTER TABLE public.atd_txdot_crash_locations OWNER TO atd_vz_data;

--
-- TOC entry 352 (class 1259 OID 2346237)
-- Name: atd_txdot_crash_locations_crash_location_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_crash_locations_crash_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_crash_locations_crash_location_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5783 (class 0 OID 0)
-- Dependencies: 352
-- Name: atd_txdot_crash_locations_crash_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_crash_locations_crash_location_id_seq OWNED BY public.atd_txdot_crash_locations.crash_location_id;


--
-- TOC entry 5619 (class 2604 OID 2346318)
-- Name: atd_txdot_crash_locations crash_location_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_locations ALTER COLUMN crash_location_id SET DEFAULT nextval('public.atd_txdot_crash_locations_crash_location_id_seq'::regclass);


--
-- TOC entry 5622 (class 2606 OID 2346724)
-- Name: atd_txdot_crash_locations atd_txdot_crash_locations_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_locations
    ADD CONSTRAINT atd_txdot_crash_locations_unique_id_key UNIQUE (crash_location_id);


--
-- TOC entry 5624 (class 2606 OID 2346730)
-- Name: atd_txdot_crash_locations atd_txdot_crashes_locations_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_locations
    ADD CONSTRAINT atd_txdot_crashes_locations_pk PRIMARY KEY (crash_location_id);


--
-- TOC entry 5620 (class 1259 OID 2346766)
-- Name: atd_txdot_crash_locations_crash_id_location_id_uindex; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX atd_txdot_crash_locations_crash_id_location_id_uindex ON public.atd_txdot_crash_locations USING btree (crash_id, location_id);


-- Completed on 2019-10-15 13:49:16 CDT

--
-- PostgreSQL database dump complete
--

