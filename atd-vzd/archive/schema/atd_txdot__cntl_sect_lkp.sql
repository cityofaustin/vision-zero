--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:51:09 CDT

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

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 273 (class 1259 OID 2345975)
-- Name: atd_txdot__cntl_sect_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cntl_sect_lkp (
    dps_region_id integer,
    dps_district_id integer,
    txdot_district_id integer,
    cris_cnty_id integer,
    road_id integer,
    cntl_sect_id integer,
    cntl_id integer,
    sect_id integer,
    cntl_sect_nbr character varying(32),
    rhino_cntl_sect_nbr integer,
    begin_milepoint numeric,
    end_milepoint numeric,
    from_dfo numeric,
    to_dfo numeric,
    create_ts character varying(32),
    update_ts character varying(32),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cntl_sect_lkp OWNER TO atd_vz_data;

--
-- TOC entry 5618 (class 2606 OID 2346556)
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_district; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_district UNIQUE (dps_district_id);


--
-- TOC entry 5620 (class 2606 OID 2346558)
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_dps_district; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_dps_district UNIQUE (txdot_district_id);


--
-- TOC entry 5622 (class 2606 OID 2346560)
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_region; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_region UNIQUE (dps_region_id);


--
-- TOC entry 5624 (class 2606 OID 2346562)
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_road; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_road UNIQUE (road_id);


-- Completed on 2019-10-15 13:51:12 CDT

--
-- PostgreSQL database dump complete
--

