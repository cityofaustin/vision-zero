--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7
-- Dumped by pg_dump version 14.7 (Debian 14.7-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: atd_txdot_change_log; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.atd_txdot_change_log (
    change_log_id integer NOT NULL,
    record_id integer NOT NULL,
    record_crash_id integer,
    record_type character varying(32) NOT NULL,
    record_json json NOT NULL,
    update_timestamp timestamp without time zone DEFAULT now(),
    id integer,
    updated_by character varying(128)
);


-- ALTER TABLE public.atd_txdot_change_log OWNER TO vze;

--
-- Name: atd_txdot_change_log_id_seq; Type: SEQUENCE; Schema: public; Owner: vze
--

CREATE SEQUENCE public.atd_txdot_change_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.atd_txdot_change_log_id_seq OWNER TO vze;

--
-- Name: atd_txdot_change_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vze
--

ALTER SEQUENCE public.atd_txdot_change_log_id_seq OWNED BY public.atd_txdot_change_log.change_log_id;


--
-- Name: atd_txdot_change_log change_log_id; Type: DEFAULT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd_txdot_change_log ALTER COLUMN change_log_id SET DEFAULT nextval('public.atd_txdot_change_log_id_seq'::regclass);


--
-- Name: atd_txdot_change_log atd_txdot_change_log_id_key; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd_txdot_change_log
    ADD CONSTRAINT atd_txdot_change_log_id_key UNIQUE (change_log_id);


--
-- Name: atd_txdot_change_log atd_txdot_change_log_pk; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd_txdot_change_log
    ADD CONSTRAINT atd_txdot_change_log_pk PRIMARY KEY (change_log_id);


--
-- Name: atd_txdot_change_log_record_crash_id_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_change_log_record_crash_id_index ON public.atd_txdot_change_log USING btree (record_crash_id);


--
-- Name: atd_txdot_change_log_record_id_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_change_log_record_id_index ON public.atd_txdot_change_log USING btree (record_id);


--
-- Name: atd_txdot_change_log_record_type_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_change_log_record_type_index ON public.atd_txdot_change_log USING btree (record_type);



--
-- PostgreSQL database dump complete
--

