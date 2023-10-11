CREATE OR REPLACE FUNCTION public.atd_txdot_locations_updates_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO atd_txdot_locations_change_log (location_id, record_json)
    VALUES (OLD.location_id, row_to_json(OLD));

    ------------------------------------------------------------------------------------------
    -- Street Name Standardization
    ------------------------------------------------------------------------------------------
    -- We have to make sure the intersection is organized alphabetically.
    -- The intersection description has to have this format:
    -- "11th @ Congress" (without the quotation marks)
    -- The script will automatically split the string by the '@' character
    -- and sort them into alphabetical order.
    IF (NEW.description IS NOT NULL) THEN
        NEW.description = (SELECT TRIM(STRING_AGG(TRIM(val), ' @ ')) AS output
                            FROM ( SELECT regexp_split_to_table(NEW.description, '@') AS val ORDER BY val ) AS sub);
    END IF;



    ------------------------------------------------------------------------------------------
    -- SCALE FACTOR
    ------------------------------------------------------------------------------------------
    -- If we have a scale factor, we assume it is in feet.
    -- The shape will be scaled up/down based on a positive or negative value in feet.
    -- The feet will then be converted to meters, which in turn is passed to the
    -- ST_Expand function, and the new shape is set based on the value it returns.
    IF(NEW.scale_factor IS NOT NULL AND NEW.shape IS NOT NULL) THEN
        NEW.shape = ST_Buffer(ST_SetSRID(NEW.shape,4326), (NEW.scale_factor/3.2808)*0.0000089);
    END IF;
    NEW.scale_factor = NULL; -- CLEAN UP FOR NEXT USE, REGARDLESS.
    --- END OF SCALE FACTOR OPERATIONS ---

    ------------------------------------------------------------------------------------------
    -- ST_CENTROID (latitude, longitude)
    ------------------------------------------------------------------------------------------
    -- If we have a shape, then calculate the centroid lat/longs
    IF(NEW.shape IS NOT NULL) THEN
        NEW.longitude = ST_X(ST_CENTROID(NEW.shape));
        NEW.latitude  = ST_Y(ST_CENTROID(NEW.shape));
    -- Else, default to NULL for lat/longs.
    ELSE
        NEW.longitude = NULL;
        NEW.latitude = NULL;
    END IF;
    --- END OF CENTROID OPERATIONS ---

    -- Record the current timestamp
    NEW.last_update = current_timestamp;
    RETURN NEW;
END;
$function$

CREATE OR REPLACE FUNCTION public.atd_txdot_locations_updates_crash_locations()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE atd_txdot_crash_locations
        SET location_id = NEW.location_id
    WHERE crash_id IN (SELECT crash_id FROM search_atd_location_crashes(NEW.location_id));

    RETURN NEW;
END;
$function$

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
-- Name: atd_txdot_locations; Type: TABLE; Schema: public; Owner: vze
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
    shape public.geometry(MultiPolygon,4326),
    latitude double precision,
    longitude double precision,
    scale_factor double precision,
    geometry public.geometry(MultiPolygon,4326),
    unique_id character varying,
    asmp_street_level integer,
    road integer,
    intersection integer,
    spine public.geometry(MultiLineString,4326),
    overlapping_geometry public.geometry(MultiPolygon,4326),
    intersection_union integer DEFAULT 0,
    broken_out_intersections_union integer DEFAULT 0,
    road_name character varying(512),
    level_1 integer DEFAULT 0,
    level_2 integer DEFAULT 0,
    level_3 integer DEFAULT 0,
    level_4 integer DEFAULT 0,
    level_5 integer DEFAULT 0,
    street_level character varying(16),
    is_intersection integer DEFAULT 0 NOT NULL,
    is_svrd integer DEFAULT 0 NOT NULL,
    council_district integer,
    non_cr3_report_count integer,
    cr3_report_count integer,
    total_crash_count integer,
    total_comprehensive_cost integer,
    total_speed_mgmt_points numeric(6,2) DEFAULT NULL::numeric,
    non_injury_count integer DEFAULT 0 NOT NULL,
    unknown_injury_count integer DEFAULT 0 NOT NULL,
    possible_injury_count integer DEFAULT 0 NOT NULL,
    non_incapacitating_injury_count integer DEFAULT 0 NOT NULL,
    suspected_serious_injury_count integer DEFAULT 0 NOT NULL,
    death_count integer DEFAULT 0 NOT NULL,
    crash_history_score numeric(4,2) DEFAULT NULL::numeric,
    sidewalk_score integer,
    bicycle_score integer,
    transit_score integer,
    community_dest_score integer,
    minority_score integer,
    poverty_score integer,
    community_context_score integer,
    total_cc_and_history_score numeric(4,2) DEFAULT NULL::numeric,
    is_intersecting_district integer DEFAULT 0,
    polygon_id character varying(16),
    signal_engineer_area_id integer,
    development_engineer_area_id integer,
    polygon_hex_id character varying(16),
    location_group smallint DEFAULT 0
);


-- ALTER TABLE public.atd_txdot_locations OWNER TO vze;

--
-- Name: atd_txdot_locations atd_txdot_locations_pk; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd_txdot_locations
    ADD CONSTRAINT atd_txdot_locations_pk PRIMARY KEY (location_id);


--
-- Name: atd_txdot_locations atd_txdot_locations_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.atd_txdot_locations
    ADD CONSTRAINT atd_txdot_locations_unique_id_key UNIQUE (location_id);


--
-- Name: atd_txdot_locations_geometry_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_geometry_index ON public.atd_txdot_locations USING gist (geometry);


--
-- Name: atd_txdot_locations_group_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_group_index ON public.atd_txdot_locations USING btree (location_group);


--
-- Name: atd_txdot_locations_level_1_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_level_1_index ON public.atd_txdot_locations USING btree (level_1);


--
-- Name: atd_txdot_locations_level_2_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_level_2_index ON public.atd_txdot_locations USING btree (level_2);


--
-- Name: atd_txdot_locations_level_3_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_level_3_index ON public.atd_txdot_locations USING btree (level_3);


--
-- Name: atd_txdot_locations_level_4_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_level_4_index ON public.atd_txdot_locations USING btree (level_4);


--
-- Name: atd_txdot_locations_level_5_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_level_5_index ON public.atd_txdot_locations USING btree (level_5);


--
-- Name: atd_txdot_locations_shape_index; Type: INDEX; Schema: public; Owner: vze
--

CREATE INDEX atd_txdot_locations_shape_index ON public.atd_txdot_locations USING gist (shape);


--
-- Name: atd_txdot_locations_unique_id_uindex; Type: INDEX; Schema: public; Owner: vze
--

CREATE UNIQUE INDEX atd_txdot_locations_unique_id_uindex ON public.atd_txdot_locations USING btree (location_id);


--
-- Name: atd_txdot_locations atd_txdot_location_audit_log; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER atd_txdot_location_audit_log BEFORE INSERT OR UPDATE ON public.atd_txdot_locations FOR EACH ROW EXECUTE FUNCTION public.atd_txdot_locations_updates_audit_log();

ALTER TABLE public.atd_txdot_locations DISABLE TRIGGER atd_txdot_location_audit_log;


--
-- Name: atd_txdot_locations atd_txdot_locations_updates_crash_locations; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER atd_txdot_locations_updates_crash_locations BEFORE UPDATE ON public.atd_txdot_locations FOR EACH ROW EXECUTE FUNCTION public.atd_txdot_locations_updates_crash_locations();

ALTER TABLE public.atd_txdot_locations DISABLE TRIGGER atd_txdot_locations_updates_crash_locations;


--
-- Name: TABLE atd_txdot_locations; Type: ACL; Schema: public; Owner: vze
--

-- GRANT SELECT ON TABLE public.atd_txdot_locations TO herefordf;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO eichelmannr;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO henryc;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO dilleym;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO apostolx;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO mcdonnellp;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO claryj;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO berryc;
-- GRANT SELECT ON TABLE public.atd_txdot_locations TO whitsont;
-- GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.atd_txdot_locations TO staff;


--
-- PostgreSQL database dump complete
--

