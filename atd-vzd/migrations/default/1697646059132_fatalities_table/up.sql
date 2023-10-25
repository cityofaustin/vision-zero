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
-- Name: fatalities; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.fatalities (
    id integer NOT NULL,
    crash_id integer NOT NULL,
    person_id integer,
    primaryperson_id integer,
    is_deleted boolean DEFAULT false NOT NULL,
    updated_by text,
    CONSTRAINT either_primaryperson_or_person CHECK ((((person_id IS NULL) AND (primaryperson_id IS NOT NULL)) OR ((person_id IS NOT NULL) AND (primaryperson_id IS NULL))))
);


-- ALTER TABLE public.fatalities OWNER TO vze;

--
-- Name: fatalities_id_seq; Type: SEQUENCE; Schema: public; Owner: vze
--

CREATE SEQUENCE public.fatalities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.fatalities_id_seq OWNER TO vze;

--
-- Name: fatalities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vze
--

ALTER SEQUENCE public.fatalities_id_seq OWNED BY public.fatalities.id;


--
-- Name: fatalities id; Type: DEFAULT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.fatalities ALTER COLUMN id SET DEFAULT nextval('public.fatalities_id_seq'::regclass);


--
-- Name: fatalities fatalities_person_id_key; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.fatalities
    ADD CONSTRAINT fatalities_person_id_key UNIQUE (person_id);


--
-- Name: fatalities fatalities_pkey; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.fatalities
    ADD CONSTRAINT fatalities_pkey PRIMARY KEY (id);


--
-- Name: fatalities fatalities_primaryperson_id_key; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.fatalities
    ADD CONSTRAINT fatalities_primaryperson_id_key UNIQUE (primaryperson_id);


--
-- Name: fatalities fatalities_crash_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.fatalities
    ADD CONSTRAINT fatalities_crash_id_fkey FOREIGN KEY (crash_id) REFERENCES cris_facts.atd_txdot_crashes(crash_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatalities fatalities_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.fatalities
    ADD CONSTRAINT fatalities_person_id_fkey FOREIGN KEY (person_id) REFERENCES cris_facts.atd_txdot_person(person_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fatalities fatalities_primaryperson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.fatalities
    ADD CONSTRAINT fatalities_primaryperson_id_fkey FOREIGN KEY (primaryperson_id) REFERENCES cris_facts.atd_txdot_primaryperson(primaryperson_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TABLE fatalities; Type: ACL; Schema: public; Owner: vze
--

-- GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.fatalities TO staff;


--
-- Name: SEQUENCE fatalities_id_seq; Type: ACL; Schema: public; Owner: vze
--

-- GRANT SELECT,USAGE ON SEQUENCE public.fatalities_id_seq TO staff;


--
-- PostgreSQL database dump complete
--

