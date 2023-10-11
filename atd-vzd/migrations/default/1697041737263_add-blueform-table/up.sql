CREATE OR REPLACE FUNCTION public.atd_txdot_blueform_update_position()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
   NEW.position = ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326);
   RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_noncr3_location()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
	-- Check if crash is on a major road and of concern to TxDOT.
	-- NEW.position is recalculated in a trigger called
	-- atd_txdot_blueform_update_position which runs before this trigger.
	IF EXISTS (
		SELECT
			ncr3m.*
		FROM
			non_cr3_mainlanes AS ncr3m
		WHERE ((NEW.position && ncr3m.geometry)
			AND ST_Contains(ST_Transform(ST_Buffer(ST_Transform(ncr3m.geometry, 2277), 1, 'endcap=flat join=round'), 4326),
				/* transform into 2277 to buffer by a foot, not a degree */
				NEW.position))) THEN
	-- If it is, then set the location_id to None
	NEW.location_id = NULL;
ELSE
	-- If it isn't on a major road and is of concern to Vision Zero, try to find a location_id for it.
	NEW.location_id = (
		SELECT
			location_id
		FROM
			atd_txdot_locations AS atl
		WHERE (atl.location_group = 1
			AND(atl.shape && NEW.position)
			AND ST_Contains(atl.shape, NEW.position)));
END IF;
	RETURN NEW;
END;
$function$;

--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7
-- Dumped by pg_dump version 14.7 (Debian 14.7-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: atd_apd_blueform; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.atd_apd_blueform (
    form_id integer NOT NULL,
    date date NOT NULL,
    case_id integer NOT NULL,
    address text,
    longitude numeric,
    latitude numeric,
    hour integer,
    location_id character varying,
    speed_mgmt_points numeric(10,2) DEFAULT 0.25,
    est_comp_cost numeric(10,2) DEFAULT '51000'::numeric,
    est_econ_cost numeric(10,2) DEFAULT '12376'::numeric,
    "position" public.geometry(Geometry,4326),
    est_comp_cost_crash_based numeric(10,2) DEFAULT 10000
);


-- ALTER TABLE public.atd_apd_blueform OWNER TO vze;

--
-- Name: atd_apd_blueform_form_id_seq; Type: SEQUENCE; Schema: public; Owner: vze
--

CREATE SEQUENCE public.atd_apd_blueform_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.atd_apd_blueform_form_id_seq OWNER TO vze;

--
-- Name: atd_apd_blueform_form_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vze
--

ALTER SEQUENCE public.atd_apd_blueform_form_id_seq OWNED BY public.atd_apd_blueform.form_id;


--
-- Name: atd_apd_blueform form_id; Type: DEFAULT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd_apd_blueform ALTER COLUMN form_id SET DEFAULT nextval('public.atd_apd_blueform_form_id_seq'::regclass);


--
-- Name: atd_apd_blueform atd_apd_blueform_pk; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd_apd_blueform
    ADD CONSTRAINT atd_apd_blueform_pk PRIMARY KEY (case_id);


--
-- Name: atd_apd_blueform_date_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_apd_blueform_date_index ON public.atd_apd_blueform USING btree (date);


--
-- Name: atd_apd_blueform_form_id_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_apd_blueform_form_id_index ON public.atd_apd_blueform USING btree (form_id);


--
-- Name: atd_apd_blueform_hour_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_apd_blueform_hour_index ON public.atd_apd_blueform USING btree (hour);


--
-- Name: atd_apd_blueform_latitude_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_apd_blueform_latitude_index ON public.atd_apd_blueform USING btree (latitude);


--
-- Name: atd_apd_blueform_location_id_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_apd_blueform_location_id_index ON public.atd_apd_blueform USING btree (location_id);


--
-- Name: atd_apd_blueform_longitude_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_apd_blueform_longitude_index ON public.atd_apd_blueform USING btree (longitude);


--
-- Name: atd_apd_blueform_position_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_apd_blueform_position_index ON public.atd_apd_blueform USING gist ("position");


--
-- Name: atd_apd_blueform atd_txdot_blueform_update_position; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER atd_txdot_blueform_update_position BEFORE INSERT OR UPDATE ON public.atd_apd_blueform FOR EACH ROW EXECUTE FUNCTION public.atd_txdot_blueform_update_position();


--
-- Name: atd_apd_blueform update_noncr3_location_on_insert; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER update_noncr3_location_on_insert BEFORE INSERT ON public.atd_apd_blueform FOR EACH ROW WHEN (((new.latitude IS NOT NULL) AND (new.longitude IS NOT NULL))) EXECUTE FUNCTION public.update_noncr3_location();


--
-- Name: atd_apd_blueform update_noncr3_location_on_update; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER update_noncr3_location_on_update BEFORE UPDATE ON public.atd_apd_blueform FOR EACH ROW WHEN (((old.latitude IS DISTINCT FROM new.latitude) OR (old.longitude IS DISTINCT FROM new.longitude))) EXECUTE FUNCTION public.update_noncr3_location();



--
-- PostgreSQL database dump complete
--

