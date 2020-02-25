--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 14:00:58 CDT

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
-- TOC entry 364 (class 1259 OID 2347469)
-- Name: view_location_injry_count_cost_summary; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_location_injry_count_cost_summary AS
SELECT atcloc.location_id
        , coalesce(ccs.total_crashes, 0) AS total_crashes
        , coalesce(ccs.total_deaths, 0) AS total_deaths
        , coalesce(ccs.total_serious_injuries, 0) AS total_serious_injuries
        , coalesce(ccs.est_comp_cost, 0) AS total_deaths

        FROM
             atd_txdot_locations AS atcloc
        LEFT JOIN (
                SELECT atcloc.location_id,
                         count(1)                           AS total_crashes,
                         sum(atc.apd_confirmed_death_count) AS total_deaths,
                         sum(atc.sus_serious_injry_cnt)     AS total_serious_injuries,
                         sum(atc.est_comp_cost)             AS est_comp_cost
                FROM (atd_txdot_crashes atc
                           LEFT JOIN atd_txdot_crash_locations atcloc ON ((atcloc.crash_id = atc.crash_id)))
                WHERE ((1 = 1) AND (atcloc.location_id IS NOT NULL) AND ((atcloc.location_id)::text <> 'None'::text))
                GROUP BY atcloc.location_id
        ) AS ccs ON (ccs.location_id = atcloc.location_id);


ALTER TABLE public.view_location_injry_count_cost_summary OWNER TO atd_vz_data;

-- Completed on 2019-10-15 14:01:02 CDT

--
-- PostgreSQL database dump complete
--

