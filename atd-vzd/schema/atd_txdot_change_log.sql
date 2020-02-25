--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:59:54 CDT

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
-- TOC entry 346 (class 1259 OID 2346209)
-- Name: atd_txdot_change_log; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_change_log (
    change_log_id integer NOT NULL,
    record_id integer NOT NULL,
    record_crash_id integer,
    record_type character varying(32) NOT NULL,
    record_json json NOT NULL,
    update_timestamp timestamp without time zone DEFAULT now(),
    id integer
);


ALTER TABLE public.atd_txdot_change_log OWNER TO atd_vz_data;

--
-- TOC entry 347 (class 1259 OID 2346216)
-- Name: atd_txdot_change_log_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_change_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_change_log_id_seq OWNER TO atd_vz_data;

--
-- TOC entry 5784 (class 0 OID 0)
-- Dependencies: 347
-- Name: atd_txdot_change_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_change_log_id_seq OWNED BY public.atd_txdot_change_log.change_log_id;


--
-- TOC entry 5618 (class 2604 OID 2346315)
-- Name: atd_txdot_change_log change_log_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_log ALTER COLUMN change_log_id SET DEFAULT nextval('public.atd_txdot_change_log_id_seq'::regclass);


--
-- TOC entry 5620 (class 2606 OID 2346708)
-- Name: atd_txdot_change_log atd_txdot_change_log_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_log
    ADD CONSTRAINT atd_txdot_change_log_id_key UNIQUE (change_log_id);


--
-- TOC entry 5622 (class 2606 OID 2346710)
-- Name: atd_txdot_change_log atd_txdot_change_log_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_log
    ADD CONSTRAINT atd_txdot_change_log_pk PRIMARY KEY (change_log_id);


--
-- TOC entry 5623 (class 1259 OID 2346759)
-- Name: atd_txdot_change_log_record_crash_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_log_record_crash_id_index ON public.atd_txdot_change_log USING btree (record_crash_id);


--
-- TOC entry 5624 (class 1259 OID 2346760)
-- Name: atd_txdot_change_log_record_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_log_record_id_index ON public.atd_txdot_change_log USING btree (record_id);


--
-- TOC entry 5625 (class 1259 OID 2346761)
-- Name: atd_txdot_change_log_record_type_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_log_record_type_index ON public.atd_txdot_change_log USING btree (record_type);


-- Completed on 2019-10-15 13:59:58 CDT

--
-- PostgreSQL database dump complete
--

