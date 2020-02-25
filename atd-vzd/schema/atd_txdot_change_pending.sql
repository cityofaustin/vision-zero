--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 14:00:03 CDT

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
-- TOC entry 348 (class 1259 OID 2346218)
-- Name: atd_txdot_change_pending; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_change_pending (
    id integer NOT NULL,
    record_id integer NOT NULL,
    record_crash_id integer,
    record_type character varying(32) NOT NULL,
    record_json json NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    last_update timestamp without time zone DEFAULT now(),
    is_retired boolean DEFAULT true
);


ALTER TABLE public.atd_txdot_change_pending OWNER TO atd_vz_data;

--
-- TOC entry 349 (class 1259 OID 2346227)
-- Name: atd_txdot_change_pending_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_change_pending_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_change_pending_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5784 (class 0 OID 0)
-- Dependencies: 349
-- Name: atd_txdot_change_pending_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_change_pending_id_seq OWNED BY public.atd_txdot_change_pending.id;


--
-- TOC entry 5620 (class 2604 OID 2346316)
-- Name: atd_txdot_change_pending id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_pending ALTER COLUMN id SET DEFAULT nextval('public.atd_txdot_change_pending_id_seq'::regclass);


--
-- TOC entry 5622 (class 2606 OID 2346712)
-- Name: atd_txdot_change_pending atd_txdot_change_pending_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_pending
    ADD CONSTRAINT atd_txdot_change_pending_pk PRIMARY KEY (id);


--
-- TOC entry 5623 (class 1259 OID 2346762)
-- Name: atd_txdot_change_pending_record_crash_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_pending_record_crash_id_index ON public.atd_txdot_change_pending USING btree (record_crash_id);


--
-- TOC entry 5624 (class 1259 OID 2346763)
-- Name: atd_txdot_change_pending_record_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_pending_record_id_index ON public.atd_txdot_change_pending USING btree (record_id);


--
-- TOC entry 5625 (class 1259 OID 2346764)
-- Name: atd_txdot_change_pending_record_type_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_pending_record_type_index ON public.atd_txdot_change_pending USING btree (record_type);


-- Completed on 2019-10-15 14:00:08 CDT

--
-- PostgreSQL database dump complete
--

