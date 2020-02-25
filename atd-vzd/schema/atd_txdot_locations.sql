--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.10

-- Started on 2019-10-15 13:48:16 CDT

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
-- TOC entry 218 (class 1259 OID 2345621)
-- Name: atd_txdot_locations; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_locations (
    location_id character varying NOT NULL,
    description text NOT NULL,
    address text,
    metadata json,
    last_update date DEFAULT now() NOT NULL,
    is_retired boolean DEFAULT false NOT NULL,
    is_studylocation boolean DEFAULT false NOT NULL,
    priority_level integer DEFAULT 0 NOT NULL,
    shape public.geometry,
    latitude double precision,
    longitude double precision,
    scale_factor double precision,
    geometry text,
    unique_id character varying,
    asmp_street_level integer
);


ALTER TABLE public.atd_txdot_locations OWNER TO atd_vz_data;

--
-- TOC entry 5622 (class 2606 OID 2346738)
-- Name: atd_txdot_locations atd_txdot_locations_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations
    ADD CONSTRAINT atd_txdot_locations_pk PRIMARY KEY (location_id);


--
-- TOC entry 5625 (class 2606 OID 2346740)
-- Name: atd_txdot_locations atd_txdot_locations_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations
    ADD CONSTRAINT atd_txdot_locations_unique_id_key UNIQUE (location_id);


--
-- TOC entry 5623 (class 1259 OID 2346773)
-- Name: atd_txdot_locations_shape_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_shape_index ON public.atd_txdot_locations USING gist (shape);


--
-- TOC entry 5626 (class 1259 OID 2346774)
-- Name: atd_txdot_locations_unique_id_uindex; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX atd_txdot_locations_unique_id_uindex ON public.atd_txdot_locations USING btree (location_id);


--
-- TOC entry 5627 (class 2620 OID 2346814)
-- Name: atd_txdot_locations atd_txdot_location_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_location_audit_log BEFORE INSERT OR UPDATE ON public.atd_txdot_locations FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_locations_updates_audit_log();

ALTER TABLE public.atd_txdot_locations DISABLE TRIGGER atd_txdot_location_audit_log;


--
-- TOC entry 5628 (class 2620 OID 2346815)
-- Name: atd_txdot_locations atd_txdot_locations_updates_crash_locations; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_locations_updates_crash_locations BEFORE UPDATE ON public.atd_txdot_locations FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_locations_updates_crash_locations();

ALTER TABLE public.atd_txdot_locations DISABLE TRIGGER atd_txdot_locations_updates_crash_locations;


-- Completed on 2019-10-15 13:48:20 CDT

--
-- PostgreSQL database dump complete
--

