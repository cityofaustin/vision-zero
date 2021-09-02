--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 14:00:12 CDT

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
-- TOC entry 351 (class 1259 OID 2346231)
-- Name: atd_txdot_cities; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_cities (
    city_id integer NOT NULL,
    city_desc text,
    eff_beg_date date,
    eff_end_date date
);


ALTER TABLE public.atd_txdot_cities OWNER TO atd_vz_data;

--
-- TOC entry 5619 (class 2606 OID 2346722)
-- Name: atd_txdot_cities atd_txdot_cities_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_cities
    ADD CONSTRAINT atd_txdot_cities_pk PRIMARY KEY (city_id);


--
-- TOC entry 5617 (class 1259 OID 2346765)
-- Name: atd_txdot_cities_city_id_uindex; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX atd_txdot_cities_city_id_uindex ON public.atd_txdot_cities USING btree (city_id);


-- Completed on 2019-10-15 14:00:15 CDT

--
-- PostgreSQL database dump complete
--

