--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:52:58 CDT

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
-- TOC entry 289 (class 1259 OID 2346029)
-- Name: atd_txdot__est_econ_cost; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__est_econ_cost (
    est_econ_cost_id integer NOT NULL,
    est_econ_cost_desc character varying(64),
    est_econ_cost_amount numeric
);


ALTER TABLE public.atd_txdot__est_econ_cost OWNER TO atd_vz_data;

--
-- TOC entry 5618 (class 2606 OID 2346596)
-- Name: atd_txdot__est_econ_cost atd_txdot__est_econ_cost_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__est_econ_cost
    ADD CONSTRAINT atd_txdot__est_econ_cost_pk PRIMARY KEY (est_econ_cost_id);


-- Completed on 2019-10-15 13:53:02 CDT

--
-- PostgreSQL database dump complete
--

