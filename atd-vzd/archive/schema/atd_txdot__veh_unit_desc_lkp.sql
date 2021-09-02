--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:59:04 CDT

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
-- TOC entry 340 (class 1259 OID 2346185)
-- Name: atd_txdot__veh_unit_desc_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_unit_desc_lkp (
    veh_unit_desc_id integer NOT NULL,
    veh_unit_desc_desc text NOT NULL,
    eff_beg_date text NOT NULL,
    eff_end_date text NOT NULL
);


ALTER TABLE public.atd_txdot__veh_unit_desc_lkp OWNER TO atd_vz_data;

--
-- TOC entry 5618 (class 2606 OID 2346696)
-- Name: atd_txdot__veh_unit_desc_lkp atd_txdot__veh_unit_desc_lkp_VEH_UNIT_DESC_ID_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_unit_desc_lkp
    ADD CONSTRAINT "atd_txdot__veh_unit_desc_lkp_VEH_UNIT_DESC_ID_key" UNIQUE (veh_unit_desc_id);


--
-- TOC entry 5620 (class 2606 OID 2346698)
-- Name: atd_txdot__veh_unit_desc_lkp atd_txdot__veh_unit_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_unit_desc_lkp
    ADD CONSTRAINT atd_txdot__veh_unit_lkp_pkey PRIMARY KEY (veh_unit_desc_id);


-- Completed on 2019-10-15 13:59:08 CDT

--
-- PostgreSQL database dump complete
--

