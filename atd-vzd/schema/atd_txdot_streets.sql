--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:45:17 CDT

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
-- TOC entry 250 (class 1259 OID 2345888)
-- Name: atd_txdot_streets; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_streets (
    street_id integer NOT NULL,
    posted_speed_limit integer,
    segment_id integer,
    prefix_direction character varying(8),
    prefix_type character varying(8),
    street_name character varying(64),
    street_type character varying(16),
    suffix_direction character varying(16),
    left_from_address integer,
    left_to_address integer,
    right_from_address integer,
    right_to_address integer,
    left_block_from integer,
    left_block_to integer,
    right_block_from integer,
    right_block_to integer,
    full_street_name text,
    road_class integer,
    speed_limit integer,
    elevation_from integer,
    elevation_to integer,
    one_way character varying(8),
    cad_id integer,
    street_place_id integer,
    created_date text,
    created_by character varying(32),
    modified_by character varying(32),
    modified_date text,
    miles numeric,
    seconds numeric,
    built_status integer,
    shape_length numeric,
    shape public.geometry
);


ALTER TABLE public.atd_txdot_streets OWNER TO atd_vz_data;

--
-- TOC entry 5619 (class 2606 OID 2346742)
-- Name: atd_txdot_streets atd_txdot_streets_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_streets
    ADD CONSTRAINT atd_txdot_streets_pk PRIMARY KEY (street_id);


--
-- TOC entry 5622 (class 2606 OID 2346744)
-- Name: atd_txdot_streets atd_txdot_streets_street_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_streets
    ADD CONSTRAINT atd_txdot_streets_street_id_key UNIQUE (street_id);


--
-- TOC entry 5617 (class 1259 OID 2346779)
-- Name: atd_txdot_streets_full_streer_name_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_streets_full_streer_name_index ON public.atd_txdot_streets USING btree (full_street_name);


--
-- TOC entry 5620 (class 1259 OID 2346780)
-- Name: atd_txdot_streets_segment_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_streets_segment_id_index ON public.atd_txdot_streets USING btree (segment_id);


--
-- TOC entry 5623 (class 1259 OID 2346781)
-- Name: atd_txdot_streets_street_place_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_streets_street_place_id_index ON public.atd_txdot_streets USING btree (street_place_id);


-- Completed on 2019-10-15 13:45:20 CDT

--
-- PostgreSQL database dump complete
--

