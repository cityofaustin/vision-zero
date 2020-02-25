--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:49:32 CDT

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

--
-- TOC entry 367 (class 1259 OID 2348653)
-- Name: atd_txdot_crash_locations_ranking; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.atd_txdot_crash_locations_ranking AS
 SELECT l.location_id,
    sum(1) AS crashes,
    sum(c.apd_confirmed_death_count) AS apd_confirmed_death_count,
    sum(c.sus_serious_injry_cnt) AS serious_injry_cnt
   FROM (public.atd_txdot_crash_locations l
     LEFT JOIN public.atd_txdot_crashes c ON ((c.crash_id = l.crash_id)))
  GROUP BY l.location_id
  ORDER BY (sum(c.sus_serious_injry_cnt)) DESC;


ALTER TABLE public.atd_txdot_crash_locations_ranking OWNER TO atd_vz_data;

-- Completed on 2019-10-15 13:49:35 CDT

--
-- PostgreSQL database dump complete
--

