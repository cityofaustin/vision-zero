--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 14:00:36 CDT

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
-- TOC entry 361 (class 1259 OID 2346269)
-- Name: view_location_crashes_by_veh_body_style; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_location_crashes_by_veh_body_style AS
 SELECT atcl.location_id,
    atvbsl.veh_body_styl_desc,
    count(1) AS count
   FROM ((public.atd_txdot_units atu
     LEFT JOIN public.atd_txdot__veh_body_styl_lkp atvbsl ON ((atu.veh_body_styl_id = atvbsl.veh_body_styl_id)))
     LEFT JOIN public.atd_txdot_crash_locations atcl ON ((atcl.crash_id = atu.crash_id)))
  WHERE ((1 = 1) AND (atcl.location_id IS NOT NULL) AND ((atcl.location_id)::text <> 'None'::text))
  GROUP BY atcl.location_id, atvbsl.veh_body_styl_desc;


ALTER TABLE public.view_location_crashes_by_veh_body_style OWNER TO atd_vz_data;

-- Completed on 2019-10-15 14:00:40 CDT

--
-- PostgreSQL database dump complete
--

