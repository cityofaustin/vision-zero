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
-- Name: afd__incidents; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.afd__incidents (
    id integer NOT NULL,
    incident_number integer,
    crash_id integer,
    unparsed_ems_incident_number text,
    ems_incident_numbers integer[],
    call_datetime timestamp without time zone,
    calendar_year text,
    jurisdiction text,
    address text,
    problem text,
    flagged_incs text,
    geometry public.geometry(Point,4326) DEFAULT NULL::public.geometry,
    austin_full_purpose boolean,
    location_id text,
    latitude double precision,
    longitude double precision,
    ems_incident_number_1 integer,
    ems_incident_number_2 integer,
    call_date date,
    call_time time without time zone
);


-- ALTER TABLE public.afd__incidents OWNER TO vze;

--
-- Name: afd__incidents_id_seq1; Type: SEQUENCE; Schema: public; Owner: vze
--

CREATE SEQUENCE public.afd__incidents_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.afd__incidents_id_seq1 OWNER TO vze;

--
-- Name: afd__incidents_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: vze
--

ALTER SEQUENCE public.afd__incidents_id_seq1 OWNED BY public.afd__incidents.id;


--
-- Name: afd__incidents id; Type: DEFAULT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.afd__incidents ALTER COLUMN id SET DEFAULT nextval('public.afd__incidents_id_seq1'::regclass);


--
-- Name: afd__incidents afd__incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.afd__incidents
    ADD CONSTRAINT afd__incidents_pkey PRIMARY KEY (id);


--
-- Name: afd__incidents afd_incidents_trigger_insert; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER afd_incidents_trigger_insert AFTER INSERT ON public.afd__incidents FOR EACH ROW EXECUTE FUNCTION public.afd_incidents_trigger();


--
-- Name: afd__incidents afd_incidents_trigger_update; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER afd_incidents_trigger_update AFTER UPDATE ON public.afd__incidents FOR EACH ROW WHEN ((false OR (old.geometry IS DISTINCT FROM new.geometry) OR (old.ems_incident_numbers IS DISTINCT FROM new.ems_incident_numbers) OR (old.call_datetime IS DISTINCT FROM new.call_datetime))) EXECUTE FUNCTION public.afd_incidents_trigger();
