--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:49:19 CDT

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
-- TOC entry 246 (class 1259 OID 2345828)
-- Name: atd_txdot_crash_status; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_crash_status (
    crash_status_id integer NOT NULL,
    description character varying(128) DEFAULT NULL::character varying,
    description_long text,
    last_update date DEFAULT now(),
    is_retired boolean DEFAULT false
);


ALTER TABLE public.atd_txdot_crash_status OWNER TO atd_vz_data;

--
-- TOC entry 353 (class 1259 OID 2346244)
-- Name: atd_txdot_crash_status_crash_status_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_crash_status_crash_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_crash_status_crash_status_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5783 (class 0 OID 0)
-- Dependencies: 353
-- Name: atd_txdot_crash_status_crash_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_crash_status_crash_status_id_seq OWNED BY public.atd_txdot_crash_status.crash_status_id;


--
-- TOC entry 5620 (class 2604 OID 2346319)
-- Name: atd_txdot_crash_status crash_status_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_status ALTER COLUMN crash_status_id SET DEFAULT nextval('public.atd_txdot_crash_status_crash_status_id_seq'::regclass);


--
-- TOC entry 5622 (class 2606 OID 2346726)
-- Name: atd_txdot_crash_status atd_txdot_crash_status_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_status
    ADD CONSTRAINT atd_txdot_crash_status_pk PRIMARY KEY (crash_status_id);


--
-- TOC entry 5624 (class 2606 OID 2346728)
-- Name: atd_txdot_crash_status atd_txdot_crash_status_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_status
    ADD CONSTRAINT atd_txdot_crash_status_unique_id_key UNIQUE (crash_status_id);


-- Completed on 2019-10-15 13:49:23 CDT

--
-- PostgreSQL database dump complete
--

