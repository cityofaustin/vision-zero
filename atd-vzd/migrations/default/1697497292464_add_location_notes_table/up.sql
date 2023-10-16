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
-- Name: location_notes; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.location_notes (
    date timestamp with time zone DEFAULT now() NOT NULL,
    user_email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    text text NOT NULL,
    id integer NOT NULL,
    location_id text NOT NULL
);


-- ALTER TABLE public.location_notes OWNER TO vze;

--
-- Name: location_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: vze
--

CREATE SEQUENCE public.location_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.location_notes_id_seq OWNER TO vze;

--
-- Name: location_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vze
--

ALTER SEQUENCE public.location_notes_id_seq OWNED BY public.location_notes.id;


--
-- Name: location_notes id; Type: DEFAULT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.location_notes ALTER COLUMN id SET DEFAULT nextval('public.location_notes_id_seq'::regclass);


--
-- Name: location_notes location_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.location_notes
    ADD CONSTRAINT location_notes_pkey PRIMARY KEY (id);


--
-- Name: location_notes set_public_location_notes_updated_at; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER set_public_location_notes_updated_at BEFORE UPDATE ON public.location_notes FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();


--
-- Name: TRIGGER set_public_location_notes_updated_at ON location_notes; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON TRIGGER set_public_location_notes_updated_at ON public.location_notes IS 'trigger to set value of column "updated_at" to current timestamp on row update';
