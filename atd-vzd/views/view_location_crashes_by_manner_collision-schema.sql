--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 14:00:43 CDT

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
-- TOC entry 363 (class 1259 OID 2347170)
-- Name: view_location_crashes_by_manner_collision; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_location_crashes_by_manner_collision AS
 SELECT atcloc.location_id,
    atcol.collsn_desc,
    count(1) AS count
   FROM ((public.atd_txdot_crashes atc
     LEFT JOIN public.atd_txdot__collsn_lkp atcol ON ((atcol.collsn_id = atc.fhe_collsn_id)))
     LEFT JOIN public.atd_txdot_crash_locations atcloc ON ((atcloc.crash_id = atc.crash_id)))
  WHERE ((1 = 1) AND (atcloc.location_id IS NOT NULL) AND ((atcloc.location_id)::text <> 'None'::text))
  GROUP BY atcloc.location_id, atcol.collsn_desc;


ALTER TABLE public.view_location_crashes_by_manner_collision OWNER TO atd_vz_data;

-- Completed on 2019-10-15 14:00:46 CDT

--
-- PostgreSQL database dump complete
--

