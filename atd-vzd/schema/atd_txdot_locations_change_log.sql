--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 14:00:20 CDT

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
-- TOC entry 355 (class 1259 OID 2346248)
-- Name: atd_txdot_locations_change_log; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_locations_change_log (
    change_log_id integer NOT NULL,
    location_id character varying(32),
    record_json json NOT NULL,
    update_timestamp timestamp without time zone DEFAULT now()
);


ALTER TABLE public.atd_txdot_locations_change_log OWNER TO atd_vz_data;

--
-- TOC entry 356 (class 1259 OID 2346255)
-- Name: atd_txdot_locations_change_log_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_locations_change_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_locations_change_log_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5780 (class 0 OID 0)
-- Dependencies: 356
-- Name: atd_txdot_locations_change_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_locations_change_log_id_seq OWNED BY public.atd_txdot_locations_change_log.change_log_id;


--
-- TOC entry 5618 (class 2604 OID 2346321)
-- Name: atd_txdot_locations_change_log change_log_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations_change_log ALTER COLUMN change_log_id SET DEFAULT nextval('public.atd_txdot_locations_change_log_id_seq'::regclass);


--
-- TOC entry 5620 (class 2606 OID 2346736)
-- Name: atd_txdot_locations_change_log atd_txdot_location_change_log_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations_change_log
    ADD CONSTRAINT atd_txdot_location_change_log_pk PRIMARY KEY (change_log_id);


--
-- TOC entry 5621 (class 1259 OID 2346772)
-- Name: atd_txdot_locations_change_log_unique_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_change_log_unique_id_index ON public.atd_txdot_locations_change_log USING btree (location_id);


-- Completed on 2019-10-15 14:00:25 CDT

--
-- PostgreSQL database dump complete
--

