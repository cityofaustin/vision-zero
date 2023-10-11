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

--
-- Name: non_cr3_mainlane_gid_seq; Type: SEQUENCE; Schema: public; Owner: vze
--

CREATE SEQUENCE public.non_cr3_mainlane_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.non_cr3_mainlane_gid_seq OWNER TO vze;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: non_cr3_mainlanes; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.non_cr3_mainlanes (
    gid integer DEFAULT nextval('public.non_cr3_mainlane_gid_seq'::regclass) NOT NULL,
    __gid bigint,
    fid numeric,
    objectid_1 numeric,
    objectid numeric,
    segmentid numeric,
    l_state character varying(80),
    r_state character varying(80),
    l_county character varying(80),
    r_county character varying(80),
    lf_addr numeric,
    lt_addr numeric,
    rf_addr numeric,
    rt_addr numeric,
    l_parity character varying(80),
    r_parity character varying(80),
    l_post_com character varying(80),
    r_post_com character varying(80),
    l_zip character varying(80),
    r_zip character varying(80),
    pre_dir character varying(80),
    st_name character varying(80),
    st_type character varying(80),
    post_dir character varying(80),
    full_name character varying(80),
    st_alias character varying(80),
    one_way character varying(80),
    sp_limit numeric,
    rdcls_typ character varying(80),
    shape_leng numeric,
    shape__len numeric,
    geometry public.geometry(MultiLineString,4326)
);


-- ALTER TABLE public.non_cr3_mainlanes OWNER TO vze;

--
-- Name: non_cr3_mainlanes non_cr3_mainlane_pkey; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.non_cr3_mainlanes
    ADD CONSTRAINT non_cr3_mainlane_pkey PRIMARY KEY (gid);


--
-- Name: non_cr3_mainlanes_geom_idx; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX non_cr3_mainlanes_geom_idx ON public.non_cr3_mainlanes USING gist (geometry);


--
-- PostgreSQL database dump complete
--

