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
-- Name: atd__mode_category_lkp; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.atd__mode_category_lkp (
    id integer NOT NULL,
    atd_mode_category_mode_name character varying(128),
    atd_mode_category_desc character varying(128)
);


-- ALTER TABLE public.atd__mode_category_lkp OWNER TO vze;

--
-- Name: atd__mode_category_lkp atd__mode_category_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd__mode_category_lkp
    ADD CONSTRAINT atd__mode_category_lkp_pkey PRIMARY KEY (id);
