--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:49:39 CDT

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
-- TOC entry 247 (class 1259 OID 2345846)
-- Name: atd_txdot_geocoders; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_geocoders (
    geocoder_id integer NOT NULL,
    name character varying,
    description text
);


ALTER TABLE public.atd_txdot_geocoders OWNER TO atd_vz_data;

--
-- TOC entry 354 (class 1259 OID 2346246)
-- Name: atd_txdot_geocoders_geocoder_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_geocoders_geocoder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_geocoders_geocoder_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5780 (class 0 OID 0)
-- Dependencies: 354
-- Name: atd_txdot_geocoders_geocoder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_geocoders_geocoder_id_seq OWNED BY public.atd_txdot_geocoders.geocoder_id;


--
-- TOC entry 5617 (class 2604 OID 2346320)
-- Name: atd_txdot_geocoders geocoder_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_geocoders ALTER COLUMN geocoder_id SET DEFAULT nextval('public.atd_txdot_geocoders_geocoder_id_seq'::regclass);


--
-- TOC entry 5619 (class 2606 OID 2346732)
-- Name: atd_txdot_geocoders atd_txdot_geocoders_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_geocoders
    ADD CONSTRAINT atd_txdot_geocoders_pkey PRIMARY KEY (geocoder_id);


--
-- TOC entry 5621 (class 2606 OID 2346734)
-- Name: atd_txdot_geocoders atd_txdot_geocoders_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_geocoders
    ADD CONSTRAINT atd_txdot_geocoders_unique_id_key UNIQUE (geocoder_id);


-- Completed on 2019-10-15 13:49:43 CDT

--
-- PostgreSQL database dump complete
--

