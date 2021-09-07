--
-- PostgreSQL database dump
--

-- Dumped from database version 10.15
-- Dumped by pg_dump version 13.3

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: atd_vz_data
--

ALTER SCHEMA public OWNER TO atd_vz_data;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: atd_vz_data
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: atd_txdot_blueform_update_position(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_blueform_update_position() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.position = ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326);
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_blueform_update_position() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_charges_updates_audit_log(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_charges_updates_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.unique_id, old.crash_id, 'charges', row_to_json(old));

   RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_charges_updates_audit_log() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_crashes_updates_audit_log(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_crashes_updates_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    estCompCostList decimal(10,2)[];
    estCompCostListCrashBased decimal(10,2)[];
    estCompEconList decimal(10,2)[];
    speedMgmtList decimal(10,2)[];
BEGIN
    ------------------------------------------------------------------------------------------
    -- CHANGE-LOG OPERATIONS
    ------------------------------------------------------------------------------------------
    -- Stores a copy of the current record into the change log
    IF  (TG_OP = 'UPDATE') then
        INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json, updated_by)
        VALUES (old.crash_id, old.crash_id, 'crashes', row_to_json(old), NEW.updated_by);
    END IF;
            
    -- COPIES THE CITY_ID INTO ORIGINAL_CITY_ID FOR BACKUP 
    IF (TG_OP = 'INSERT') THEN
            NEW.original_city_id = NEW.city_id;
    END IF;

    ------------------------------------------------------------------------------------------
    -- LATITUDE / LONGITUDE OPERATIONS
    ------------------------------------------------------------------------------------------

    -- When CRIS is present, populate values to Primary column
    -- NOTE: It will update primary only if there is no lat/long data in the geo-coded or primary columns.
    -- If there is data in primary coordinates, then it will not do anything.
    -- If the there is geocoded data, it will not do anything.
    IF (
        (NEW.latitude is not null AND NEW.longitude is not null)
        AND (NEW.latitude_geocoded is null AND NEW.longitude_geocoded is null)
        AND (NEW.latitude_primary is null AND NEW.longitude_primary is null)
    ) THEN
        NEW.latitude_primary = NEW.latitude;
        NEW.longitude_primary = NEW.longitude;
    END IF;

    -- When GeoCoded lat/longs are present, populate value to Primary
    -- NOTE: It will only update if there are geocoded lat/longs and there are no primary lat/longs
    IF (
        (NEW.latitude_geocoded is not null AND NEW.longitude_geocoded is not null)
        AND (NEW.latitude_primary is null AND NEW.longitude_primary is null)
    ) THEN
        NEW.latitude_primary = NEW.latitude_geocoded;
        NEW.longitude_primary = NEW.longitude_geocoded;
    END IF;
    -- Finally we update the position field
    NEW.position = ST_SetSRID(ST_MakePoint(NEW.longitude_primary, NEW.latitude_primary), 4326);
    --- END OF LAT/LONG OPERATIONS ---


	------------------------------------------------------------------------------------------
    -- CONFIRMED ADDRESSES
    ------------------------------------------------------------------------------------------

    -- If there is no confirmed primary address provided, then generate it:
    IF (NEW.address_confirmed_primary IS NULL) THEN
    	  NEW.address_confirmed_primary 	= TRIM(CONCAT(NEW.rpt_street_pfx, ' ', NEW.rpt_block_num, ' ', NEW.rpt_street_name, ' ', NEW.rpt_street_sfx));
    END IF;
    -- If there is no confirmed secondary address provided, then generate it:
    IF (NEW.address_confirmed_secondary IS NULL) THEN
		    NEW.address_confirmed_secondary = TRIM(CONCAT(NEW.rpt_sec_street_pfx, ' ', NEW.rpt_sec_block_num, ' ', NEW.rpt_sec_street_name, ' ', NEW.rpt_sec_street_sfx));
    END IF;
    --- END OF ADDRESS OPERATIONS ---

    ------------------------------------------------------------------------------------------
    -- APD's Death Count
    ------------------------------------------------------------------------------------------
    -- If our apd death count is null, then assume death_cnt's value
    IF (NEW.atd_fatality_count IS NULL) THEN
        NEW.atd_fatality_count = NEW.death_cnt;
	  END IF;

    IF (NEW.apd_confirmed_death_count IS NULL) THEN
        NEW.apd_confirmed_death_count = NEW.death_cnt;
    -- Otherwise, the value has been entered manually, signal change with confirmed as 'Y'
    ELSE
        IF (NEW.apd_confirmed_death_count > 0) THEN
            NEW.apd_confirmed_fatality = 'Y';
        ELSE
            NEW.apd_confirmed_fatality = 'N';
        END IF;
    END IF;
    -- If the death count is any different from the original, then it is human-manipulated.
    IF (NEW.apd_confirmed_death_count = NEW.death_cnt) THEN
        NEW.apd_human_update = 'N';
    ELSE
        NEW.apd_human_update = 'Y';
    END IF;
    -- END OF APD's DEATH COUNT

    ------------------------------------------------------------------------------------------
    -- ESTIMATED COSTS
    ------------------------------------------------------------------------------------------

    -- First we need to gather a list of all of our costs, comprehensive and economic.
    estCompCostList = ARRAY(SELECT est_comp_cost_amount FROM atd_txdot__est_comp_cost ORDER BY est_comp_cost_id ASC);
    estCompCostListCrashBased = ARRAY(SELECT est_comp_cost_amount FROM atd_txdot__est_comp_cost_crash_based ORDER BY est_comp_cost_id ASC);
    estCompEconList = ARRAY(SELECT est_econ_cost_amount FROM atd_txdot__est_econ_cost ORDER BY est_econ_cost_id ASC);

    NEW.est_comp_cost = (0
       + (NEW.unkn_injry_cnt * (estCompCostList[1]))
       + (NEW.atd_fatality_count * (estCompCostList[2]))
       + (NEW.sus_serious_injry_cnt * (estCompCostList[3]))
       + (NEW.nonincap_injry_cnt * (estCompCostList[4]))
       + (NEW.poss_injry_cnt * (estCompCostList[5]))
       + (NEW.non_injry_cnt * (estCompCostList[6]))
    )::decimal(10,2);

    IF (NEW.atd_fatality_count > 0) THEN NEW.est_comp_cost_crash_based = estCompCostListCrashBased[1];
    ELSIF (NEW.sus_serious_injry_cnt > 0) THEN NEW.est_comp_cost_crash_based = estCompCostListCrashBased[2];
    ELSIF (NEW.nonincap_injry_cnt > 0) THEN NEW.est_comp_cost_crash_based = estCompCostListCrashBased[3];
    ELSIF (NEW.poss_injry_cnt > 0) THEN NEW.est_comp_cost_crash_based = estCompCostListCrashBased[4];
    ELSIF (NEW.non_injry_cnt > 0) THEN NEW.est_comp_cost_crash_based = estCompCostListCrashBased[5];
    ELSIF (NEW.unkn_injry_cnt > 0) THEN NEW.est_comp_cost_crash_based = estCompCostListCrashBased[6];
    ELSE NEW.est_comp_cost_crash_based = 0;
    END IF;

    NEW.est_econ_cost = (0
       + (NEW.unkn_injry_cnt * (estCompEconList[1]))
       + (NEW.atd_fatality_count * (estCompEconList[2]))
       + (NEW.sus_serious_injry_cnt * (estCompEconList[3]))
       + (NEW.nonincap_injry_cnt * (estCompEconList[4]))
       + (NEW.poss_injry_cnt * (estCompEconList[5]))
       + (NEW.non_injry_cnt * (estCompEconList[6]))
    )::decimal(10,2);

    --- END OF COST OPERATIONS ---

    ------------------------------------------------------------------------------------------
    -- SPEED MGMT POINTS
    ------------------------------------------------------------------------------------------
    speedMgmtList = ARRAY (SELECT speed_mgmt_points FROM atd_txdot__speed_mgmt_lkp ORDER BY speed_mgmt_id ASC);

	  NEW.speed_mgmt_points = (0
	  	 + (NEW.unkn_injry_cnt * (speedMgmtList [1]))
       + (NEW.atd_fatality_count * (speedMgmtList [2]))
       + (NEW.sus_serious_injry_cnt * (speedMgmtList [3]))
       + (NEW.nonincap_injry_cnt * (speedMgmtList [4]))
       + (NEW.poss_injry_cnt * (speedMgmtList [5]))
       + (NEW.non_injry_cnt * (speedMgmtList [6]))
    )::decimal (10,2);
    --- END OF SPEED MGMT POINTS ---

    ------------------------------------------------------------------------------------------
    -- MODE CATEGORY DATA
    ------------------------------------------------------------------------------------------
    NEW.atd_mode_category_metadata = get_crash_modes(NEW.crash_id);
    --- END OF MODE CATEGORY DATA ---

    ------------------------------------------------------------------------------------------
    -- AUSTIN FULL PURPOSE
    ------------------------------------------------------------------------------------------
    -- Set Austin Full Purpose to Y (TRUE) when it has Austin City ID and no coordinates.
    IF (NEW.position IS NULL and NEW.city_id = 22) THEN
        NEW.austin_full_purpose = 'Y';
    END IF;    
    --- END OF AUSTIN FULL PURPOSE ---

    -- Record the current timestamp
    NEW.last_update = current_timestamp;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_crashes_updates_audit_log() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_locations_updates_audit_log(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_locations_updates_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.atd_txdot_locations_updates_audit_log() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_locations_updates_crash_locations(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_locations_updates_crash_locations() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE atd_txdot_crash_locations
        SET location_id = NEW.location_id
    WHERE crash_id IN (SELECT crash_id FROM search_atd_location_crashes(NEW.location_id));

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_locations_updates_crash_locations() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_person_updates_audit_log(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_person_updates_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.person_id, old.crash_id, 'person', row_to_json(old));

   RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_person_updates_audit_log() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_primaryperson_updates_audit_log(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_primaryperson_updates_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN 
    INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.primaryperson_id, old.crash_id, 'primaryperson', row_to_json(old));

   RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_primaryperson_updates_audit_log() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units_create(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_units_create() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN

  NEW.travel_direction = NEW.veh_trvl_dir_id;
 	NEW.movement_id = 0;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_units_create() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units_create_update(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_units_create_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.atd_mode_category = (CASE
       -- PEDALCYCLIST / BYCICLE
       WHEN NEW.unit_desc_id = 3 THEN 5
       -- MOTORIZED CONVEYANCE / MICROMOBILITY DEVICE
       WHEN NEW.unit_desc_id = 5 THEN 6
       -- PEDESTRIAN
       WHEN NEW.unit_desc_id = 4 THEN 7
       -- TRAIN
       WHEN NEW.unit_desc_id = 2 THEN 8
       -- MOTOR VEHICLE
       WHEN NEW.unit_desc_id = 1 THEN (
           CASE
           -- PASSENGER CAR
           WHEN NEW.veh_body_styl_id IN (100,104) THEN 1
           -- LARGE PASSENGER CAR
           WHEN NEW.veh_body_styl_id IN (30, 69, 103, 106) THEN 2
           -- MOTORCYCLE
           WHEN NEW.veh_body_styl_id = 71 THEN 3

           ELSE 4 END
       ) ELSE 9
    END);

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_units_create_update() OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units_updates_audit_log(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.atd_txdot_units_updates_audit_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.unit_id, old.crash_id, 'units', row_to_json(old));

   RETURN NEW;
END;
$$;


ALTER FUNCTION public.atd_txdot_units_updates_audit_log() OWNER TO atd_vz_data;

--
-- Name: exec(text); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.exec(text) RETURNS text
    LANGUAGE plpgsql
    AS $_$ BEGIN EXECUTE $1; RETURN $1; END; $_$;


ALTER FUNCTION public.exec(text) OWNER TO atd_vz_data;

SET default_tablespace = '';

--
-- Name: atd_txdot_crashes; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_crashes (
    crash_id integer NOT NULL,
    crash_fatal_fl character varying(1),
    cmv_involv_fl character varying(1),
    schl_bus_fl character varying(1),
    rr_relat_fl character varying(1),
    medical_advisory_fl character varying(1),
    amend_supp_fl character varying(1),
    active_school_zone_fl character varying(1),
    crash_date date,
    crash_time time without time zone,
    case_id character varying(32),
    local_use character varying(32),
    rpt_cris_cnty_id integer,
    rpt_city_id integer,
    rpt_outside_city_limit_fl character varying(1),
    thousand_damage_fl character varying(1),
    rpt_latitude double precision,
    rpt_longitude double precision,
    rpt_rdwy_sys_id integer,
    rpt_hwy_num character varying(32),
    rpt_hwy_sfx character varying(32),
    rpt_road_part_id integer,
    rpt_block_num character varying(32),
    rpt_street_pfx character varying(32),
    rpt_street_name character varying(256),
    rpt_street_sfx character varying(32),
    private_dr_fl character varying(1),
    toll_road_fl character varying(1),
    crash_speed_limit integer,
    road_constr_zone_fl character varying(1),
    road_constr_zone_wrkr_fl character varying(1),
    rpt_street_desc character varying(256),
    at_intrsct_fl character varying(1),
    rpt_sec_rdwy_sys_id integer,
    rpt_sec_hwy_num character varying(32),
    rpt_sec_hwy_sfx character varying(25),
    rpt_sec_road_part_id integer,
    rpt_sec_block_num character varying(32),
    rpt_sec_street_pfx character varying(32),
    rpt_sec_street_name character varying(256),
    rpt_sec_street_sfx character varying(32),
    rpt_ref_mark_offset_amt double precision,
    rpt_ref_mark_dist_uom character varying(16),
    rpt_ref_mark_dir character varying(16),
    rpt_ref_mark_nbr character varying(32),
    rpt_sec_street_desc character varying(256),
    rpt_crossingnumber character varying(32),
    wthr_cond_id integer,
    light_cond_id integer,
    entr_road_id integer,
    road_type_id integer,
    road_algn_id integer,
    surf_cond_id integer,
    traffic_cntl_id integer,
    investigat_notify_time time without time zone,
    investigat_notify_meth character varying(32),
    investigat_arrv_time time without time zone,
    report_date date,
    investigat_comp_fl character varying(1),
    investigator_name character varying(128),
    id_number character varying(32),
    ori_number character varying(32),
    investigat_agency_id integer,
    investigat_area_id integer,
    investigat_district_id integer,
    investigat_region_id integer,
    bridge_detail_id integer,
    harm_evnt_id integer,
    intrsct_relat_id integer,
    fhe_collsn_id integer,
    obj_struck_id integer,
    othr_factr_id integer,
    road_part_adj_id integer,
    road_cls_id integer,
    road_relat_id integer,
    phys_featr_1_id integer,
    phys_featr_2_id integer,
    cnty_id integer,
    city_id integer,
    latitude double precision,
    longitude double precision,
    hwy_sys character varying(32),
    hwy_nbr character varying(32),
    hwy_sfx character varying(32),
    dfo double precision,
    street_name character varying(256),
    street_nbr character varying(32),
    control integer,
    section integer,
    milepoint double precision,
    ref_mark_nbr integer,
    ref_mark_displ double precision,
    hwy_sys_2 character varying(32),
    hwy_nbr_2 character varying(32),
    hwy_sfx_2 character varying(32),
    street_name_2 character varying(256),
    street_nbr_2 character varying(32),
    control_2 integer,
    section_2 integer,
    milepoint_2 double precision,
    txdot_rptable_fl character varying(1),
    onsys_fl character varying(1),
    rural_fl character varying(1),
    crash_sev_id integer,
    pop_group_id integer,
    located_fl character varying(1),
    day_of_week character varying(8),
    hwy_dsgn_lane_id character varying(25),
    hwy_dsgn_hrt_id character varying(25),
    hp_shldr_left character varying(25),
    hp_shldr_right character varying(25),
    hp_median_width character varying(25),
    base_type_id character varying(25),
    nbr_of_lane character varying(25),
    row_width_usual character varying(25),
    roadbed_width character varying(25),
    surf_width character varying(25),
    surf_type_id character varying(25),
    curb_type_left_id integer,
    curb_type_right_id integer,
    shldr_type_left_id integer,
    shldr_width_left integer,
    shldr_use_left_id integer,
    shldr_type_right_id integer,
    shldr_width_right integer,
    shldr_use_right_id integer,
    median_type_id integer,
    median_width integer,
    rural_urban_type_id integer,
    func_sys_id integer,
    adt_curnt_amt integer,
    adt_curnt_year integer,
    adt_adj_curnt_amt integer,
    pct_single_trk_adt double precision,
    pct_combo_trk_adt double precision,
    trk_aadt_pct double precision,
    curve_type_id integer,
    curve_lngth integer,
    cd_degr integer,
    delta_left_right_id integer,
    dd_degr integer,
    feature_crossed character varying(32),
    structure_number character varying(32),
    i_r_min_vert_clear character varying(32),
    approach_width character varying(32),
    bridge_median_id character varying(32),
    bridge_loading_type_id character varying(32),
    bridge_loading_in_1000_lbs character varying(32),
    bridge_srvc_type_on_id character varying(32),
    bridge_srvc_type_under_id character varying(32),
    culvert_type_id character varying(32),
    roadway_width character varying(32),
    deck_width character varying(32),
    bridge_dir_of_traffic_id character varying(32),
    bridge_rte_struct_func_id character varying(32),
    bridge_ir_struct_func_id character varying(32),
    crossingnumber character varying(32),
    rrco character varying(32),
    poscrossing_id character varying(32),
    wdcode_id character varying(32),
    standstop character varying(32),
    yield character varying(32),
    sus_serious_injry_cnt integer,
    nonincap_injry_cnt integer,
    poss_injry_cnt integer,
    non_injry_cnt integer,
    unkn_injry_cnt integer,
    tot_injry_cnt integer,
    death_cnt integer,
    mpo_id integer,
    investigat_service_id integer,
    investigat_da_id integer,
    investigator_narrative text,
    geocoded character varying(1) DEFAULT 'N'::character varying,
    geocode_status character varying(16) DEFAULT 'NA'::character varying NOT NULL,
    latitude_geocoded double precision,
    longitude_geocoded double precision,
    latitude_primary double precision,
    longitude_primary double precision,
    geocode_date timestamp without time zone,
    geocode_provider integer DEFAULT 0,
    qa_status integer DEFAULT 0 NOT NULL,
    last_update timestamp without time zone DEFAULT now(),
    approval_date timestamp without time zone,
    approved_by character varying(128),
    is_retired boolean DEFAULT false,
    updated_by character varying,
    address_confirmed_primary text,
    address_confirmed_secondary text,
    est_comp_cost numeric(10,2) DEFAULT 0.00,
    est_econ_cost numeric(10,2) DEFAULT 0.00,
    "position" public.geometry(Geometry,4326),
    apd_confirmed_fatality character varying(1) DEFAULT 'N'::character varying NOT NULL,
    apd_confirmed_death_count integer,
    micromobility_device_flag character varying(1) DEFAULT 'N'::character varying NOT NULL,
    cr3_stored_flag character varying(1) DEFAULT 'N'::character varying NOT NULL,
    apd_human_update character varying DEFAULT 'N'::character varying NOT NULL,
    speed_mgmt_points numeric(10,2) DEFAULT 0.00,
    geocode_match_quality numeric,
    geocode_match_metadata json,
    atd_mode_category_metadata json,
    location_id character varying,
    changes_approved_date timestamp without time zone,
    austin_full_purpose character varying(1) DEFAULT 'N'::character varying NOT NULL,
    original_city_id integer,
    atd_fatality_count integer,
    temp_record boolean DEFAULT false,
    cr3_file_metadata jsonb,
    cr3_ocr_extraction_date timestamp with time zone,
    investigator_narrative_ocr text,
    est_comp_cost_crash_based numeric(10,2) DEFAULT 0
);


ALTER TABLE public.atd_txdot_crashes OWNER TO atd_vz_data;

--
-- Name: find_cr3_collisions_for_location(character varying); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_cr3_collisions_for_location(id character varying) RETURNS SETOF public.atd_txdot_crashes
    LANGUAGE sql STABLE
    AS $$
SELECT
  *
FROM
  atd_txdot_crashes AS cr3_crash
WHERE
	ST_Contains((
		SELECT
  atd_loc.shape
FROM atd_txdot_locations AS atd_loc
WHERE
			atd_loc.location_id::VARCHAR=id), ST_SetSRID(ST_MakePoint(cr3_crash.longitude_primary, cr3_crash.latitude_primary), 4326))
$$;


ALTER FUNCTION public.find_cr3_collisions_for_location(id character varying) OWNER TO atd_vz_data;

--
-- Name: find_cr3_mainlane_crash(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_cr3_mainlane_crash(cr3_crash_id integer) RETURNS SETOF public.atd_txdot_crashes
    LANGUAGE sql STABLE
    AS $$
    SELECT atc.*
    FROM atd_txdot_crashes AS atc
            INNER JOIN cr3_mainlanes AS cr3m ON (
            atc.position && cr3m.geometry
            AND ST_Contains(
                    ST_Transform(
                            ST_Buffer(
                                    ST_Transform(cr3m.geometry, 2277),
                                    1,
                                    'endcap=flat join=round'
                                ), 4326
                        ),
                    atc.position
                )
        )
    WHERE atc.crash_id = cr3_crash_id
$$;


ALTER FUNCTION public.find_cr3_mainlane_crash(cr3_crash_id integer) OWNER TO atd_vz_data;

--
-- Name: find_crash_in_jurisdiction(integer, integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_crash_in_jurisdiction(jurisdiction_id integer, given_crash_id integer) RETURNS SETOF public.atd_txdot_crashes
    LANGUAGE sql STABLE
    AS $$
    (
        SELECT atc.* FROM atd_txdot_crashes AS atc
          INNER JOIN atd_jurisdictions aj
            ON ( 1=1
                AND aj.id = jurisdiction_id
                AND (aj.geometry && atc.position)
                AND ST_Contains(aj.geometry, atc.position)
            )
        WHERE 1=1
          AND crash_id = given_crash_id
    )
$$;


ALTER FUNCTION public.find_crash_in_jurisdiction(jurisdiction_id integer, given_crash_id integer) OWNER TO atd_vz_data;

--
-- Name: atd_jurisdictions; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_jurisdictions (
    id integer NOT NULL,
    city_name character varying(30),
    jurisdiction_label character varying(50),
    geometry public.geometry(MultiPolygon,4326)
);


ALTER TABLE public.atd_jurisdictions OWNER TO atd_vz_data;

--
-- Name: find_crash_jurisdictions(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_crash_jurisdictions(given_crash_id integer) RETURNS SETOF public.atd_jurisdictions
    LANGUAGE sql STABLE
    AS $$
(
    SELECT aj.*
    FROM atd_txdot_crashes AS atc
        INNER JOIN atd_jurisdictions aj
        ON ( 1=1
            AND (aj.geometry && atc.position)
            AND ST_Contains(aj.geometry, atc.position)
        )
    WHERE 1=1
    AND atc.crash_id = given_crash_id
)
$$;


ALTER FUNCTION public.find_crash_jurisdictions(given_crash_id integer) OWNER TO atd_vz_data;

--
-- Name: find_crashes_in_jurisdiction(integer, date, date); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_crashes_in_jurisdiction(jurisdiction_id integer, crash_date_min date, crash_date_max date) RETURNS SETOF public.atd_txdot_crashes
    LANGUAGE sql STABLE
    AS $$
    (
        SELECT atc.* FROM atd_txdot_crashes AS atc
          INNER JOIN atd_jurisdictions aj
            ON ( 1=1
                AND aj.id = jurisdiction_id
                AND (aj.geometry && atc.position)
                AND ST_Contains(aj.geometry, atc.position)
            )
        WHERE 1=1
          AND atc.position IS NOT NULL
          AND atc.crash_date >= crash_date_min
          AND atc.crash_date <= crash_date_max
    ) UNION ALL (
        SELECT atc.* FROM atd_txdot_crashes AS atc
        WHERE 1=1
          AND atc.city_id = 22
          AND atc.position IS NULL
          AND atc.crash_date >= crash_date_min
          AND atc.crash_date <= crash_date_max
    )
$$;


ALTER FUNCTION public.find_crashes_in_jurisdiction(jurisdiction_id integer, crash_date_min date, crash_date_max date) OWNER TO atd_vz_data;

--
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


ALTER TABLE public.atd_txdot_locations OWNER TO atd_vz_data;

--
-- Name: find_location_for_cr3_collision(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_location_for_cr3_collision(id integer) RETURNS SETOF public.atd_txdot_locations
    LANGUAGE sql STABLE
    AS $$SELECT atl.* FROM atd_txdot_crashes AS atc
  INNER JOIN atd_txdot_locations AS atl
    ON ( 1=1
        AND atl.location_group = 1
        AND (atl.shape && st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
        AND ST_Contains(atl.shape, st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
    )
WHERE 1=1
  AND atc.crash_id = id
$$;


ALTER FUNCTION public.find_location_for_cr3_collision(id integer) OWNER TO atd_vz_data;

--
-- Name: find_location_for_noncr3_collision(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_location_for_noncr3_collision(id integer) RETURNS SETOF public.atd_txdot_locations
    LANGUAGE sql STABLE
    AS $$SELECT atl.* FROM atd_apd_blueform AS aab
                      INNER JOIN atd_txdot_locations AS atl
                                 ON ( 1=1
                                     AND atl.location_group = 1
                                     AND (atl.shape && st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
                                     AND ST_Contains(atl.shape, st_setsrid(ST_POINT(aab.longitude, aab.latitude ), 4326))
                                     )
WHERE 1=1
  AND aab.case_id = id
$$;


ALTER FUNCTION public.find_location_for_noncr3_collision(id integer) OWNER TO atd_vz_data;

--
-- Name: find_location_id_for_cr3_collision(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_location_id_for_cr3_collision(id integer) RETURNS character varying
    LANGUAGE sql STABLE
    AS $$    SELECT atl.location_id FROM atd_txdot_crashes AS atc
      INNER JOIN atd_txdot_locations AS atl
        ON ( 1=1
            AND atl.location_group = 1
            AND (atl.shape && st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
            AND ST_Contains(atl.shape, st_setsrid(ST_POINT(atc.longitude_primary, atc.latitude_primary ), 4326))
		 )
    WHERE atc.crash_id = id LIMIT 1
$$;


ALTER FUNCTION public.find_location_id_for_cr3_collision(id integer) OWNER TO atd_vz_data;

--
-- Name: atd_apd_blueform; Type: TABLE; Schema: public; Owner: atd_vz_data
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


ALTER TABLE public.atd_apd_blueform OWNER TO atd_vz_data;

--
-- Name: find_noncr3_collisions_for_location(character varying); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_noncr3_collisions_for_location(id character varying) RETURNS SETOF public.atd_apd_blueform
    LANGUAGE sql STABLE
    AS $$
SELECT
  *
FROM
  atd_apd_blueform AS blueform
WHERE
	ST_Contains((
		SELECT
  atd_loc.shape
FROM atd_txdot_locations AS atd_loc
WHERE
			atd_loc.location_id::VARCHAR=id), ST_SetSRID(ST_MakePoint (blueform.longitude, blueform.latitude), 4326))
$$;


ALTER FUNCTION public.find_noncr3_collisions_for_location(id character varying) OWNER TO atd_vz_data;

--
-- Name: find_noncr3_mainlane_crash(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_noncr3_mainlane_crash(ncr3_case_id integer) RETURNS SETOF public.atd_apd_blueform
    LANGUAGE sql STABLE
    AS $$
SELECT atc.*
FROM atd_apd_blueform AS atc
        INNER JOIN non_cr3_mainlanes AS ncr3m ON (
            atc.position && ncr3m.geometry
            AND ST_Contains(
                ST_Transform(
                        ST_Buffer(
                            ST_Transform(ncr3m.geometry, 2277),
                            1,
                            'endcap=flat join=round'
                        ),
                        4326
                ), /* transform into 2277 to buffer by a foot, not a degree */
                atc.position
            )
    )
WHERE atc.case_id = ncr3_case_id
$$;


ALTER FUNCTION public.find_noncr3_mainlane_crash(ncr3_case_id integer) OWNER TO atd_vz_data;

--
-- Name: find_service_road_location_for_centerline_crash(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.find_service_road_location_for_centerline_crash(input_crash_id integer) RETURNS SETOF public.atd_txdot_locations
    LANGUAGE sql STABLE
    AS $$
-- this CTE will setup a in-memory table containing one crash_id, its position, 
-- and the seek direction if and only if the crash supplied lies within a mainlane strip
with crash as (
  WITH cr3_mainlanes AS (
    SELECT st_transform(st_buffer(st_transform(st_union(cr3_mainlanes.geometry), 2277), 1), 4326) AS geometry
      FROM cr3_mainlanes
      )
  select c.crash_id, position,
    CASE
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'w' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'w' THEN 0
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'n' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'n' THEN 90
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'e' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 'e' THEN 180
      WHEN "substring"(lower(c.rpt_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 's' 
        OR "substring"(lower(c.rpt_sec_street_name), '\s?([nsew])[arthous]*\s??b(oun)?d?') ~* 's' THEN 270
      ELSE NULL
    END AS seek_direction
  from atd_txdot_crashes c
  join atd_jurisdictions aj on (aj.id = 5)
  join cr3_mainlanes on (ST_Contains(cr3_mainlanes.geometry, c.position))
  where 1 = 1
  and st_contains(aj.geometry, c.position) and c.private_dr_fl = 'N'
  and c.rpt_road_part_id = ANY (ARRAY[2, 3, 4, 5, 7])
  and c.crash_id = input_crash_id
  limit 1
)
-- this query joins the crash found in the CTE with the polygon layer to find the closest 
-- polygon centroid in the cone eminating from the crash location in the seek_direction defined in the CTE
select l.*
from atd_txdot_locations l
join crash c on (1 = 1)
where
CASE
  WHEN
  CASE
    WHEN (c.seek_direction - 65) < 0 THEN c.seek_direction - 65 + 360
    ELSE c.seek_direction - 65
  END < ((c.seek_direction + 65) % 360) THEN (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) >=
    CASE
      WHEN (c.seek_direction - 65) < 0 THEN c.seek_direction - 65 + 360
      ELSE c.seek_direction - 65
    END 
    AND (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) <= ((c.seek_direction + 65) % 360)
ELSE (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) >=
    CASE
      WHEN (c.seek_direction - 65) < 0 THEN c.seek_direction - 65 + 360
      ELSE c.seek_direction - 65
    END 
    OR (st_azimuth(c.position, st_centroid(l.shape)) * 180 / pi()) <= ((c.seek_direction + 65) % 360)
end
AND st_intersects(st_transform(st_buffer(st_transform(c.position, 2277), 750), 4326), l.shape) 
AND l.description ~~* '%SVRD%'
ORDER BY (st_distance(st_centroid(l.shape), c.position))
limit 1
$$;


ALTER FUNCTION public.find_service_road_location_for_centerline_crash(input_crash_id integer) OWNER TO atd_vz_data;

--
-- Name: get_crash_modes(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.get_crash_modes(input_crash_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
        totals json;
BEGIN
    SELECT INTO totals json_agg(row_to_json(result))
    FROM (
        SELECT  vmode.mode_id,
                mode.atd_mode_category_mode_name AS mode_desc,
                vmode.unit_id,
                vmode.death_cnt,
                vmode.sus_serious_injry_cnt,
                vmode.nonincap_injry_cnt,
                vmode.poss_injry_cnt,
                vmode.non_injry_cnt,
                vmode.unkn_injry_cnt,
                vmode.tot_injry_cnt
        FROM (
            SELECT unit_id, (
                       CASE
                           -- PEDALCYCLIST / BYCICLE
                           WHEN vdesc.veh_unit_desc_id = 3 THEN 5
                           -- MOTORIZED CONVEYANCE / MICROMOBILITY DEVICE
                           WHEN vdesc.veh_unit_desc_id = 5 THEN 6
                           -- PEDESTRIAN
                           WHEN vdesc.veh_unit_desc_id = 4 THEN 7
                           -- TRAIN
                           WHEN vdesc.veh_unit_desc_id = 2 THEN 8
                           -- MOTOR VEHICLE
                           WHEN vdesc.veh_unit_desc_id = 1 THEN (
                               CASE
                               -- PASSENGER CAR
                               WHEN vbody.veh_body_styl_id IN (100,104) THEN 1
                               -- LARGE PASSENGER CAR
                               WHEN vbody.veh_body_styl_id IN (30, 69, 103, 106) THEN 2
                               -- MOTORCYCLE
                               WHEN vbody.veh_body_styl_id = 71 THEN 3

                               ELSE 4 END
                           ) ELSE 9
                       END
                ) AS mode_id,
                    death_cnt,
                    sus_serious_injry_cnt,
                    nonincap_injry_cnt,
                    poss_injry_cnt,
                    non_injry_cnt,
                    unkn_injry_cnt,
                    tot_injry_cnt

                FROM atd_txdot_units AS atu
                    LEFT JOIN atd_txdot__veh_unit_desc_lkp AS vdesc ON vdesc.veh_unit_desc_id = atu.unit_desc_id
                    LEFT JOIN atd_txdot__veh_body_styl_lkp AS vbody ON vbody.veh_body_styl_id = atu.veh_body_styl_id
                WHERE crash_id = input_crash_id
        ) AS vmode
        LEFT JOIN atd__mode_category_lkp AS mode ON mode.id = vmode.mode_id
    ) AS result;
    RETURN totals;
END; $$;


ALTER FUNCTION public.get_crash_modes(input_crash_id integer) OWNER TO atd_vz_data;

--
-- Name: get_est_comp_cost(integer, integer, integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.get_est_comp_cost(unkn_injry_cnt integer, atd_fatality_count integer, sus_serious_injry_cnt integer, nonincap_injry_cnt integer, poss_injry_cnt integer, non_injry_cnt integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (0
       + (unkn_injry_cnt * (51000))
       + (atd_fatality_count * (2829000))
       + (sus_serious_injry_cnt * (2315000))
       + (nonincap_injry_cnt * (233000))
       + (poss_injry_cnt * (233000))
       + (non_injry_cnt * (51000))
   )::decimal(10,2);
END;
$$;


ALTER FUNCTION public.get_est_comp_cost(unkn_injry_cnt integer, atd_fatality_count integer, sus_serious_injry_cnt integer, nonincap_injry_cnt integer, poss_injry_cnt integer, non_injry_cnt integer) OWNER TO atd_vz_data;

--
-- Name: get_est_econ_cost(integer, integer, integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.get_est_econ_cost(unkn_injry_cnt integer, atd_fatality_count integer, sus_serious_injry_cnt integer, nonincap_injry_cnt integer, poss_injry_cnt integer, non_injry_cnt integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (0
       + (unkn_injry_cnt * (12376))
       + (atd_fatality_count * (1679600))
       + (sus_serious_injry_cnt * (97552))
       + (nonincap_injry_cnt * (28184))
       + (poss_injry_cnt * (23192))
       + (non_injry_cnt * (12376))
   )::decimal(10,2);
END;
$$;


ALTER FUNCTION public.get_est_econ_cost(unkn_injry_cnt integer, atd_fatality_count integer, sus_serious_injry_cnt integer, nonincap_injry_cnt integer, poss_injry_cnt integer, non_injry_cnt integer) OWNER TO atd_vz_data;

--
-- Name: atd_location_crash_and_cost_totals; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_location_crash_and_cost_totals (
    location_id character varying NOT NULL,
    total_crashes bigint NOT NULL,
    total_est_comp_cost numeric NOT NULL,
    cr3_total_crashes bigint NOT NULL,
    cr3_est_comp_cost numeric NOT NULL,
    noncr3_total_crashes bigint NOT NULL,
    noncr3_est_comp_cost numeric NOT NULL
);


ALTER TABLE public.atd_location_crash_and_cost_totals OWNER TO atd_vz_data;

--
-- Name: TABLE atd_location_crash_and_cost_totals; Type: COMMENT; Schema: public; Owner: atd_vz_data
--

COMMENT ON TABLE public.atd_location_crash_and_cost_totals IS 'Table provides SETOF output for get_location_totals fn';


--
-- Name: get_location_totals(date, date, character varying, character varying); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.get_location_totals(cr3_crash_date date, noncr3_crash_date date, cr3_location character varying, noncr3_location character varying) RETURNS SETOF public.atd_location_crash_and_cost_totals
    LANGUAGE sql STABLE
    AS $$
WITH
  -- This CTE+join mechanism is a way to pack two, simple
  -- queries together into one larger query and compute
  -- derived results from their results.
  --
  -- In our first CTE, we'll count up the number of
  -- non-CR3 crashes and their sum of their comprehensive
  -- cost which are associated to a given location occuring
  -- after a given date.
  --
  -- All non-CR3 crashes are given a standard
  -- comprehensive cost, and this value is provided as
  -- an argument to this query.
  --
  -- An important thing to note is that this CTE query will
  -- only return a single row under any circumstances.
  noncr3 AS (
    SELECT COUNT(aab.case_id) AS total_crashes,
      COUNT(aab.case_id) *
        (select est_comp_cost_amount from atd_txdot__est_comp_cost_crash_based where est_comp_cost_id = 7)
      AS est_comp_cost
    FROM atd_apd_blueform aab
    WHERE aab.location_id = noncr3_location
      AND aab.date >= noncr3_crash_date
  ),
  -- A very similar query, again returning a single row,
  -- to compute the count and aggregate comprehensive cost
  -- for CR3 crashes.
  cr3 AS (
    SELECT COUNT(atc.crash_id) AS total_crashes,
      -- In the case of no CR3 crashes, the SUM() returns null,
      -- which in turn causes 'total_est_comp_cost' to be null
      -- in the main query, as INT + null = null.
      COALESCE(SUM(est_comp_cost_crash_based),0) AS est_comp_cost
    FROM atd_txdot_crashes atc
    WHERE atc.location_id = cr3_location
      AND atc.crash_date >= cr3_crash_date
  )
-- Add the two crash types respective values together to
-- get values for all crashes for the location. Also,
-- pass through the individual crash type values in the final
-- result.
SELECT cr3_location AS location_id,
       cr3.total_crashes + noncr3.total_crashes AS total_crashes,
       cr3.est_comp_cost + noncr3.est_comp_cost AS total_est_comp_cost,
       cr3.total_crashes AS cr3_total_crashes,
       cr3.est_comp_cost AS cr3_est_comp_cost,
       noncr3.total_crashes AS noncr3_total_crashes,
       noncr3.est_comp_cost AS noncr3_est_comp_cost
-- This is an implicit join of the two CTE tables. Because each
-- table is known to have only a single row, the result will also
-- be a single row, 1 * 1 = 1. This is why we have no need for a WHERE
-- clause, as we narrowed down to the actual data we need in the CTEs.
-- Joining a table of a single row to another talbe of a single row
-- essentaily performs a concatenation of the two rows.
FROM noncr3, cr3
  $$;


ALTER FUNCTION public.get_location_totals(cr3_crash_date date, noncr3_crash_date date, cr3_location character varying, noncr3_location character varying) OWNER TO atd_vz_data;

--
-- Name: get_speed_mgmt_points(integer, integer, integer, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.get_speed_mgmt_points(unkn_injry_cnt integer, atd_fatality_count integer, sus_serious_injry_cnt integer, nonincap_injry_cnt integer, poss_injry_cnt integer, non_injry_cnt integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
    BEGIN
        RETURN (0
            + (unkn_injry_cnt * (0.25))
            + (atd_fatality_count * (10))
            + (sus_serious_injry_cnt * (8))
            + (nonincap_injry_cnt * (1))
            + (poss_injry_cnt * (1))
            + (non_injry_cnt * (0.25))
        )::decimal (10,2);
    END;
$$;


ALTER FUNCTION public.get_speed_mgmt_points(unkn_injry_cnt integer, atd_fatality_count integer, sus_serious_injry_cnt integer, nonincap_injry_cnt integer, poss_injry_cnt integer, non_injry_cnt integer) OWNER TO atd_vz_data;

--
-- Name: search_atd_crash_location(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.search_atd_crash_location(crash_id integer) RETURNS SETOF public.atd_txdot_locations
    LANGUAGE sql STABLE
    AS $$
    SELECT * FROM atd_txdot_locations AS atl
    WHERE ST_Contains(atl.shape, (SELECT atc.position FROM atd_txdot_crashes AS atc WHERE atc.crash_id = crash_id))
$$;


ALTER FUNCTION public.search_atd_crash_location(crash_id integer) OWNER TO atd_vz_data;

--
-- Name: search_atd_crash_locations(integer); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.search_atd_crash_locations(crash_id integer) RETURNS SETOF public.atd_txdot_locations
    LANGUAGE sql STABLE
    AS $$
    SELECT * FROM atd_txdot_locations AS atl
    WHERE ST_Contains(atl.shape, (SELECT atc.position FROM atd_txdot_crashes AS atc WHERE atc.crash_id = crash_id LIMIT 1))
    LIMIT 1
$$;


ALTER FUNCTION public.search_atd_crash_locations(crash_id integer) OWNER TO atd_vz_data;

--
-- Name: search_atd_location_crashes(character varying); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.search_atd_location_crashes(location_id character varying) RETURNS SETOF public.atd_txdot_crashes
    LANGUAGE sql STABLE
    AS $$
    SELECT atc.* FROM atd_txdot_crashes AS atc
    JOIN atd_txdot_locations AS atl ON ST_CONTAINS(atl.shape, atc.position)
    WHERE atl.unique_id = location_id;
$$;


ALTER FUNCTION public.search_atd_location_crashes(location_id character varying) OWNER TO atd_vz_data;

--
-- Name: update_modified_crash_row(); Type: FUNCTION; Schema: public; Owner: atd_vz_data
--

CREATE FUNCTION public.update_modified_crash_row() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.last_update = now();

    -- We need to update the position if both latitude_confirmed and longitude_confirmed are provided
    IF NEW.latitude_confirmed IS NOT NULL AND NEW.longitude_confirmed IS NOT NULL THEN
        NEW.position = point(NEW.latitude_confirmed, NEW.longitude_confirmed);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modified_crash_row() OWNER TO atd_vz_data;

--
-- Name: all_atd_apd_blueform; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.all_atd_apd_blueform AS
 SELECT c.form_id,
    c.date,
    c.case_id,
    c.address,
    c.longitude,
    c.latitude,
    c.hour,
    c.location_id,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    p.location_id AS surface_polygon_hex_id
   FROM (public.atd_apd_blueform c
     LEFT JOIN public.atd_txdot_locations p ON (((p.location_group = 1) AND (c."position" OPERATOR(public.&&) p.geometry) AND public.st_contains(p.geometry, c."position"))))
  WHERE (c.date >= ('2020-11-23'::date - '5 years'::interval))
  WITH NO DATA;


ALTER TABLE public.all_atd_apd_blueform OWNER TO atd_vz_data;

--
-- Name: all_atd_txdot_crashes; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.all_atd_txdot_crashes AS
 SELECT c.crash_id,
    c.crash_fatal_fl,
    c.cmv_involv_fl,
    c.schl_bus_fl,
    c.rr_relat_fl,
    c.medical_advisory_fl,
    c.amend_supp_fl,
    c.active_school_zone_fl,
    c.crash_date,
    c.crash_time,
    c.case_id,
    c.local_use,
    c.rpt_cris_cnty_id,
    c.rpt_city_id,
    c.rpt_outside_city_limit_fl,
    c.thousand_damage_fl,
    c.rpt_latitude,
    c.rpt_longitude,
    c.rpt_rdwy_sys_id,
    c.rpt_hwy_num,
    c.rpt_hwy_sfx,
    c.rpt_road_part_id,
    c.rpt_block_num,
    c.rpt_street_pfx,
    c.rpt_street_name,
    c.rpt_street_sfx,
    c.private_dr_fl,
    c.toll_road_fl,
    c.crash_speed_limit,
    c.road_constr_zone_fl,
    c.road_constr_zone_wrkr_fl,
    c.rpt_street_desc,
    c.at_intrsct_fl,
    c.rpt_sec_rdwy_sys_id,
    c.rpt_sec_hwy_num,
    c.rpt_sec_hwy_sfx,
    c.rpt_sec_road_part_id,
    c.rpt_sec_block_num,
    c.rpt_sec_street_pfx,
    c.rpt_sec_street_name,
    c.rpt_sec_street_sfx,
    c.rpt_ref_mark_offset_amt,
    c.rpt_ref_mark_dist_uom,
    c.rpt_ref_mark_dir,
    c.rpt_ref_mark_nbr,
    c.rpt_sec_street_desc,
    c.rpt_crossingnumber,
    c.wthr_cond_id,
    c.light_cond_id,
    c.entr_road_id,
    c.road_type_id,
    c.road_algn_id,
    c.surf_cond_id,
    c.traffic_cntl_id,
    c.investigat_notify_time,
    c.investigat_notify_meth,
    c.investigat_arrv_time,
    c.report_date,
    c.investigat_comp_fl,
    c.investigator_name,
    c.id_number,
    c.ori_number,
    c.investigat_agency_id,
    c.investigat_area_id,
    c.investigat_district_id,
    c.investigat_region_id,
    c.bridge_detail_id,
    c.harm_evnt_id,
    c.intrsct_relat_id,
    c.fhe_collsn_id,
    c.obj_struck_id,
    c.othr_factr_id,
    c.road_part_adj_id,
    c.road_cls_id,
    c.road_relat_id,
    c.phys_featr_1_id,
    c.phys_featr_2_id,
    c.cnty_id,
    c.city_id,
    c.latitude,
    c.longitude,
    c.hwy_sys,
    c.hwy_nbr,
    c.hwy_sfx,
    c.dfo,
    c.street_name,
    c.street_nbr,
    c.control,
    c.section,
    c.milepoint,
    c.ref_mark_nbr,
    c.ref_mark_displ,
    c.hwy_sys_2,
    c.hwy_nbr_2,
    c.hwy_sfx_2,
    c.street_name_2,
    c.street_nbr_2,
    c.control_2,
    c.section_2,
    c.milepoint_2,
    c.txdot_rptable_fl,
    c.onsys_fl,
    c.rural_fl,
    c.crash_sev_id,
    c.pop_group_id,
    c.located_fl,
    c.day_of_week,
    c.hwy_dsgn_lane_id,
    c.hwy_dsgn_hrt_id,
    c.hp_shldr_left,
    c.hp_shldr_right,
    c.hp_median_width,
    c.base_type_id,
    c.nbr_of_lane,
    c.row_width_usual,
    c.roadbed_width,
    c.surf_width,
    c.surf_type_id,
    c.curb_type_left_id,
    c.curb_type_right_id,
    c.shldr_type_left_id,
    c.shldr_width_left,
    c.shldr_use_left_id,
    c.shldr_type_right_id,
    c.shldr_width_right,
    c.shldr_use_right_id,
    c.median_type_id,
    c.median_width,
    c.rural_urban_type_id,
    c.func_sys_id,
    c.adt_curnt_amt,
    c.adt_curnt_year,
    c.adt_adj_curnt_amt,
    c.pct_single_trk_adt,
    c.pct_combo_trk_adt,
    c.trk_aadt_pct,
    c.curve_type_id,
    c.curve_lngth,
    c.cd_degr,
    c.delta_left_right_id,
    c.dd_degr,
    c.feature_crossed,
    c.structure_number,
    c.i_r_min_vert_clear,
    c.approach_width,
    c.bridge_median_id,
    c.bridge_loading_type_id,
    c.bridge_loading_in_1000_lbs,
    c.bridge_srvc_type_on_id,
    c.bridge_srvc_type_under_id,
    c.culvert_type_id,
    c.roadway_width,
    c.deck_width,
    c.bridge_dir_of_traffic_id,
    c.bridge_rte_struct_func_id,
    c.bridge_ir_struct_func_id,
    c.crossingnumber,
    c.rrco,
    c.poscrossing_id,
    c.wdcode_id,
    c.standstop,
    c.yield,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt,
    c.mpo_id,
    c.investigat_service_id,
    c.investigat_da_id,
    c.investigator_narrative,
    c.geocoded,
    c.geocode_status,
    c.latitude_geocoded,
    c.longitude_geocoded,
    c.latitude_primary,
    c.longitude_primary,
    c.geocode_date,
    c.geocode_provider,
    c.qa_status,
    c.last_update,
    c.approval_date,
    c.approved_by,
    c.is_retired,
    c.updated_by,
    c.address_confirmed_primary,
    c.address_confirmed_secondary,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.apd_confirmed_fatality,
    c.apd_confirmed_death_count,
    c.micromobility_device_flag,
    c.cr3_stored_flag,
    c.apd_human_update,
    c.speed_mgmt_points,
    c.geocode_match_quality,
    c.geocode_match_metadata,
    c.atd_mode_category_metadata,
    c.location_id,
    c.changes_approved_date,
    c.austin_full_purpose,
    c.original_city_id,
    c.atd_fatality_count,
    c.temp_record,
    c.cr3_file_metadata,
    c.cr3_ocr_extraction_date,
    p.location_id AS surface_polygon_hex_id
   FROM (public.atd_txdot_crashes c
     LEFT JOIN public.atd_txdot_locations p ON (((p.location_group = 1) AND (c."position" OPERATOR(public.&&) p.geometry) AND public.st_contains(p.geometry, c."position"))))
  WHERE (c.crash_date >= ('2020-11-23'::date - '5 years'::interval))
  WITH NO DATA;


ALTER TABLE public.all_atd_txdot_crashes OWNER TO atd_vz_data;

--
-- Name: cr3_mainlanes_gid_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.cr3_mainlanes_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cr3_mainlanes_gid_seq OWNER TO atd_vz_data;

--
-- Name: cr3_mainlanes; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.cr3_mainlanes (
    gid integer DEFAULT nextval('public.cr3_mainlanes_gid_seq'::regclass) NOT NULL,
    fid numeric,
    objectid numeric,
    rec bigint,
    di bigint,
    co bigint,
    city bigint,
    hwy character varying(7),
    hsys character varying(2),
    hnum character varying(4),
    hsuf character varying(1),
    frm_nbr bigint,
    frm_suf character varying(1),
    frm_num character varying(5),
    frm_disp numeric,
    to_nbr bigint,
    to_suf character varying(1),
    to_num character varying(5),
    to_disp numeric,
    rdbd_id character varying(2),
    len_sec numeric,
    hwy_stat bigint,
    rd_mn_stat bigint,
    f_system bigint,
    fun_sys bigint,
    fun_sys_ex bigint,
    ru_f_syste character varying(2),
    admin bigint,
    admin_old bigint,
    uan bigint,
    sec_ste character varying(1),
    sec_ntrk bigint,
    sec_haz character varying(1),
    sec_nhs bigint,
    sec_trunk character varying(1),
    sec_str bigint,
    sec_str_co bigint,
    sec_nfh character varying(1),
    sec_stm character varying(1),
    sec_ttt character varying(1),
    sec_park character varying(1),
    sec_bic character varying(1),
    sec_adp character varying(1),
    sec_urb character varying(1),
    sec_fed_ai character varying(1),
    sec_evac character varying(1),
    sec_q character varying(1),
    sec_r character varying(1),
    sec_s character varying(1),
    sec_t character varying(1),
    sec_u character varying(1),
    sec_v character varying(1),
    sec_w character varying(1),
    sec_x character varying(1),
    sec_y character varying(1),
    sec_z character varying(1),
    gov_ctr_lv bigint,
    hpmsid character varying(12),
    pct_sadt numeric,
    pct_cadt numeric,
    pct_sdhv numeric,
    pct_cdhv numeric,
    ru bigint,
    spec_sys bigint,
    con character varying(4),
    sec bigint,
    c_sec character varying(7),
    msa_cnty bigint,
    msa_cls bigint,
    hwy_des1 character varying(1),
    hwy_des2 character varying(1),
    maint_dis bigint,
    mpa bigint,
    cen_place bigint,
    mkr_date bigint,
    hwy_stat_d bigint,
    hwy_note character varying(30),
    mnt_fman bigint,
    mnt_sec bigint,
    adt_cur bigint,
    adt_year bigint,
    adt_desgn bigint,
    adt_adj bigint,
    adt_hist_y bigint,
    hy_1 bigint,
    hy_2 bigint,
    hy_3 bigint,
    hy_4 bigint,
    hy_5 bigint,
    hy_6 bigint,
    hy_7 bigint,
    hy_8 bigint,
    hy_9 bigint,
    hp_swl bigint,
    hp_swr bigint,
    hp_med_w bigint,
    hp_vol_grp bigint,
    ria_resv bigint,
    ath_pct bigint,
    ath_100 bigint,
    desgn_yr bigint,
    dhv bigint,
    d_fac bigint,
    trk_aadt_p numeric,
    trk_dhv_pc numeric,
    k_fac numeric,
    flex_esal bigint,
    rigid_esal bigint,
    base_tp bigint,
    spd_max bigint,
    spd_min bigint,
    num_lanes bigint,
    row_w_usl bigint,
    sur_w bigint,
    rb_wid bigint,
    srf_type bigint,
    curb_l bigint,
    curb_r bigint,
    dir_trav bigint,
    phy_rdbd character varying(1),
    s_type_i bigint,
    s_wid_i bigint,
    s_use_i bigint,
    s_type_o bigint,
    s_wid_o bigint,
    s_use_o bigint,
    row_min bigint,
    load_axle bigint,
    load_gross bigint,
    load_tand bigint,
    med_type bigint,
    med_wid bigint,
    data_date character varying(5),
    frm_dfo numeric,
    to_dfo numeric,
    ri_mpt_dat bigint,
    bmp numeric,
    emp numeric,
    ri_mpt_len numeric,
    trf_sta_id character varying(30),
    ste_nam character varying(15),
    b_term character varying(15),
    e_term character varying(15),
    hov_typ bigint,
    ria_rte_id character varying(10),
    old_surf_t bigint,
    aadt_singl bigint,
    aadt_combi bigint,
    surf_treat bigint,
    surf_tre_1 numeric,
    surf_tre_2 bigint,
    spec_lanes character varying(1),
    spec_lan_1 bigint,
    pct_pk_sut numeric,
    pct_pk_cut numeric,
    shape_leng numeric,
    geometry public.geometry(MultiLineString,4326)
);


ALTER TABLE public.cr3_mainlanes OWNER TO atd_vz_data;

--
-- Name: all_cr3_crashes_off_mainlane; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.all_cr3_crashes_off_mainlane AS
 WITH cr3_mainlanes AS (
         SELECT public.st_transform(public.st_buffer(public.st_transform(public.st_union(cr3_mainlanes.geometry), 2277), (1)::double precision), 4326) AS geometry
           FROM public.cr3_mainlanes
        )
 SELECT c.crash_id,
    c.crash_fatal_fl,
    c.cmv_involv_fl,
    c.schl_bus_fl,
    c.rr_relat_fl,
    c.medical_advisory_fl,
    c.amend_supp_fl,
    c.active_school_zone_fl,
    c.crash_date,
    c.crash_time,
    c.case_id,
    c.local_use,
    c.rpt_cris_cnty_id,
    c.rpt_city_id,
    c.rpt_outside_city_limit_fl,
    c.thousand_damage_fl,
    c.rpt_latitude,
    c.rpt_longitude,
    c.rpt_rdwy_sys_id,
    c.rpt_hwy_num,
    c.rpt_hwy_sfx,
    c.rpt_road_part_id,
    c.rpt_block_num,
    c.rpt_street_pfx,
    c.rpt_street_name,
    c.rpt_street_sfx,
    c.private_dr_fl,
    c.toll_road_fl,
    c.crash_speed_limit,
    c.road_constr_zone_fl,
    c.road_constr_zone_wrkr_fl,
    c.rpt_street_desc,
    c.at_intrsct_fl,
    c.rpt_sec_rdwy_sys_id,
    c.rpt_sec_hwy_num,
    c.rpt_sec_hwy_sfx,
    c.rpt_sec_road_part_id,
    c.rpt_sec_block_num,
    c.rpt_sec_street_pfx,
    c.rpt_sec_street_name,
    c.rpt_sec_street_sfx,
    c.rpt_ref_mark_offset_amt,
    c.rpt_ref_mark_dist_uom,
    c.rpt_ref_mark_dir,
    c.rpt_ref_mark_nbr,
    c.rpt_sec_street_desc,
    c.rpt_crossingnumber,
    c.wthr_cond_id,
    c.light_cond_id,
    c.entr_road_id,
    c.road_type_id,
    c.road_algn_id,
    c.surf_cond_id,
    c.traffic_cntl_id,
    c.investigat_notify_time,
    c.investigat_notify_meth,
    c.investigat_arrv_time,
    c.report_date,
    c.investigat_comp_fl,
    c.investigator_name,
    c.id_number,
    c.ori_number,
    c.investigat_agency_id,
    c.investigat_area_id,
    c.investigat_district_id,
    c.investigat_region_id,
    c.bridge_detail_id,
    c.harm_evnt_id,
    c.intrsct_relat_id,
    c.fhe_collsn_id,
    c.obj_struck_id,
    c.othr_factr_id,
    c.road_part_adj_id,
    c.road_cls_id,
    c.road_relat_id,
    c.phys_featr_1_id,
    c.phys_featr_2_id,
    c.cnty_id,
    c.city_id,
    c.latitude,
    c.longitude,
    c.hwy_sys,
    c.hwy_nbr,
    c.hwy_sfx,
    c.dfo,
    c.street_name,
    c.street_nbr,
    c.control,
    c.section,
    c.milepoint,
    c.ref_mark_nbr,
    c.ref_mark_displ,
    c.hwy_sys_2,
    c.hwy_nbr_2,
    c.hwy_sfx_2,
    c.street_name_2,
    c.street_nbr_2,
    c.control_2,
    c.section_2,
    c.milepoint_2,
    c.txdot_rptable_fl,
    c.onsys_fl,
    c.rural_fl,
    c.crash_sev_id,
    c.pop_group_id,
    c.located_fl,
    c.day_of_week,
    c.hwy_dsgn_lane_id,
    c.hwy_dsgn_hrt_id,
    c.hp_shldr_left,
    c.hp_shldr_right,
    c.hp_median_width,
    c.base_type_id,
    c.nbr_of_lane,
    c.row_width_usual,
    c.roadbed_width,
    c.surf_width,
    c.surf_type_id,
    c.curb_type_left_id,
    c.curb_type_right_id,
    c.shldr_type_left_id,
    c.shldr_width_left,
    c.shldr_use_left_id,
    c.shldr_type_right_id,
    c.shldr_width_right,
    c.shldr_use_right_id,
    c.median_type_id,
    c.median_width,
    c.rural_urban_type_id,
    c.func_sys_id,
    c.adt_curnt_amt,
    c.adt_curnt_year,
    c.adt_adj_curnt_amt,
    c.pct_single_trk_adt,
    c.pct_combo_trk_adt,
    c.trk_aadt_pct,
    c.curve_type_id,
    c.curve_lngth,
    c.cd_degr,
    c.delta_left_right_id,
    c.dd_degr,
    c.feature_crossed,
    c.structure_number,
    c.i_r_min_vert_clear,
    c.approach_width,
    c.bridge_median_id,
    c.bridge_loading_type_id,
    c.bridge_loading_in_1000_lbs,
    c.bridge_srvc_type_on_id,
    c.bridge_srvc_type_under_id,
    c.culvert_type_id,
    c.roadway_width,
    c.deck_width,
    c.bridge_dir_of_traffic_id,
    c.bridge_rte_struct_func_id,
    c.bridge_ir_struct_func_id,
    c.crossingnumber,
    c.rrco,
    c.poscrossing_id,
    c.wdcode_id,
    c.standstop,
    c.yield,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt,
    c.mpo_id,
    c.investigat_service_id,
    c.investigat_da_id,
    c.investigator_narrative,
    c.geocoded,
    c.geocode_status,
    c.latitude_geocoded,
    c.longitude_geocoded,
    c.latitude_primary,
    c.longitude_primary,
    c.geocode_date,
    c.geocode_provider,
    c.qa_status,
    c.last_update,
    c.approval_date,
    c.approved_by,
    c.is_retired,
    c.updated_by,
    c.address_confirmed_primary,
    c.address_confirmed_secondary,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.apd_confirmed_fatality,
    c.apd_confirmed_death_count,
    c.micromobility_device_flag,
    c.cr3_stored_flag,
    c.apd_human_update,
    c.speed_mgmt_points,
    c.geocode_match_quality,
    c.geocode_match_metadata,
    c.atd_mode_category_metadata,
    c.location_id,
    c.changes_approved_date,
    c.austin_full_purpose,
    c.original_city_id,
    c.atd_fatality_count,
    c.temp_record,
    c.cr3_file_metadata,
    c.cr3_ocr_extraction_date,
    c.surface_polygon_hex_id
   FROM public.all_atd_txdot_crashes c,
    cr3_mainlanes l
  WHERE (NOT public.st_contains(l.geometry, c."position"))
  WITH NO DATA;


ALTER TABLE public.all_cr3_crashes_off_mainlane OWNER TO atd_vz_data;

--
-- Name: non_cr3_mainlane_gid_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.non_cr3_mainlane_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.non_cr3_mainlane_gid_seq OWNER TO atd_vz_data;

--
-- Name: non_cr3_mainlanes; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.non_cr3_mainlanes (
    gid integer DEFAULT nextval('public.non_cr3_mainlane_gid_seq'::regclass) NOT NULL,
    __gid bigint,
    fid numeric,
    objectid_1 numeric,
    objectid numeric,
    segmentid numeric,
    l_state character varying(80),
    r_state character varying(80),
    l_county character varying(80),
    r_county character varying(80),
    lf_addr numeric,
    lt_addr numeric,
    rf_addr numeric,
    rt_addr numeric,
    l_parity character varying(80),
    r_parity character varying(80),
    l_post_com character varying(80),
    r_post_com character varying(80),
    l_zip character varying(80),
    r_zip character varying(80),
    pre_dir character varying(80),
    st_name character varying(80),
    st_type character varying(80),
    post_dir character varying(80),
    full_name character varying(80),
    st_alias character varying(80),
    one_way character varying(80),
    sp_limit numeric,
    rdcls_typ character varying(80),
    shape_leng numeric,
    shape__len numeric,
    geometry public.geometry(MultiLineString,4326)
);


ALTER TABLE public.non_cr3_mainlanes OWNER TO atd_vz_data;

--
-- Name: all_non_cr3_crashes_off_mainlane; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.all_non_cr3_crashes_off_mainlane AS
 WITH non_cr3_mainlanes AS (
         SELECT public.st_transform(public.st_buffer(public.st_transform(public.st_union(non_cr3_mainlanes.geometry), 2277), (1)::double precision), 4326) AS geometry
           FROM public.non_cr3_mainlanes
        )
 SELECT c.form_id,
    c.date,
    c.case_id,
    c.address,
    c.longitude,
    c.latitude,
    c.hour,
    c.location_id,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.surface_polygon_hex_id
   FROM public.all_atd_apd_blueform c,
    non_cr3_mainlanes l
  WHERE (NOT public.st_contains(l.geometry, c."position"))
  WITH NO DATA;


ALTER TABLE public.all_non_cr3_crashes_off_mainlane OWNER TO atd_vz_data;

--
-- Name: all_crashes_off_mainlane; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.all_crashes_off_mainlane AS
 SELECT 1 AS non_cr3,
    0 AS cr3,
    all_non_cr3_crashes_off_mainlane.case_id AS crash_id,
    all_non_cr3_crashes_off_mainlane.date,
    all_non_cr3_crashes_off_mainlane.speed_mgmt_points,
    all_non_cr3_crashes_off_mainlane.est_comp_cost,
    all_non_cr3_crashes_off_mainlane.est_econ_cost,
    all_non_cr3_crashes_off_mainlane."position" AS geometry,
    0 AS sus_serious_injry_cnt,
    0 AS nonincap_injry_cnt,
    0 AS poss_injry_cnt,
    0 AS non_injry_cnt,
    0 AS unkn_injry_cnt,
    0 AS tot_injry_cnt,
    0 AS death_cnt
   FROM public.all_non_cr3_crashes_off_mainlane
UNION
 SELECT 0 AS non_cr3,
    1 AS cr3,
    all_cr3_crashes_off_mainlane.crash_id,
    all_cr3_crashes_off_mainlane.crash_date AS date,
    all_cr3_crashes_off_mainlane.speed_mgmt_points,
    all_cr3_crashes_off_mainlane.est_comp_cost,
    all_cr3_crashes_off_mainlane.est_econ_cost,
    all_cr3_crashes_off_mainlane."position" AS geometry,
    all_cr3_crashes_off_mainlane.sus_serious_injry_cnt,
    all_cr3_crashes_off_mainlane.nonincap_injry_cnt,
    all_cr3_crashes_off_mainlane.poss_injry_cnt,
    all_cr3_crashes_off_mainlane.non_injry_cnt,
    all_cr3_crashes_off_mainlane.unkn_injry_cnt,
    all_cr3_crashes_off_mainlane.tot_injry_cnt,
    all_cr3_crashes_off_mainlane.death_cnt
   FROM public.all_cr3_crashes_off_mainlane
  WITH NO DATA;


ALTER TABLE public.all_crashes_off_mainlane OWNER TO atd_vz_data;

--
-- Name: atd__mode_category_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd__mode_category_lkp (
    id integer NOT NULL,
    atd_mode_category_mode_name character varying(128),
    atd_mode_category_desc character varying(128)
);


ALTER TABLE public.atd__mode_category_lkp OWNER TO atd_vz_data;

--
-- Name: atd_apd_blueform_form_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_apd_blueform_form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_apd_blueform_form_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_apd_blueform_form_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_apd_blueform_form_id_seq OWNED BY public.atd_apd_blueform.form_id;


--
-- Name: atd_jurisdictions_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_jurisdictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_jurisdictions_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_jurisdictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_jurisdictions_id_seq OWNED BY public.atd_jurisdictions.id;


--
-- Name: atd_txdot__agency_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__agency_lkp (
    agency_id integer NOT NULL,
    agency_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__agency_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__airbag_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__airbag_lkp (
    airbag_id integer NOT NULL,
    airbag_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__airbag_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__asmp_level_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__asmp_level_lkp (
    asmp_level_id integer NOT NULL,
    asmp_level_desc text NOT NULL
);


ALTER TABLE public.atd_txdot__asmp_level_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__base_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__base_type_lkp (
    base_type_id integer NOT NULL,
    base_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__base_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_detail_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_detail_lkp (
    bridge_detail_id integer NOT NULL,
    bridge_detail_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_detail_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_dir_of_traffic_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_dir_of_traffic_lkp (
    bridge_dir_of_traffic_id integer NOT NULL,
    bridge_dir_of_traffic_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_dir_of_traffic_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_ir_struct_func_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_ir_struct_func_lkp (
    bridge_ir_struct_func_id integer NOT NULL,
    bridge_ir_struct_func_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_ir_struct_func_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_loading_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_loading_type_lkp (
    bridge_loading_type_id integer NOT NULL,
    bridge_loading_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_loading_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_median_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_median_lkp (
    bridge_median_id integer NOT NULL,
    bridge_median_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_median_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_rte_struct_func_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_rte_struct_func_lkp (
    bridge_rte_struct_func_id integer NOT NULL,
    bridge_rte_struct_func_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_rte_struct_func_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_srvc_type_on_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_srvc_type_on_lkp (
    bridge_srvc_type_on_id integer NOT NULL,
    bridge_srvc_type_on_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_srvc_type_on_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bridge_srvc_type_under_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bridge_srvc_type_under_lkp (
    bridge_srvc_type_under_id integer NOT NULL,
    bridge_srvc_type_under_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bridge_srvc_type_under_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__bus_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__bus_type_lkp (
    bus_type_id integer NOT NULL,
    bus_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__bus_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__carrier_id_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__carrier_id_type_lkp (
    carrier_id_type_id integer NOT NULL,
    carrier_id_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__carrier_id_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__carrier_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__carrier_type_lkp (
    carrier_type_id integer NOT NULL,
    carrier_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__carrier_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cas_transp_locat_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cas_transp_locat_lkp (
    cas_transp_locat_id integer NOT NULL,
    cas_transp_locat_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cas_transp_locat_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cas_transp_name_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cas_transp_name_lkp (
    cas_transp_name_id integer NOT NULL,
    cas_transp_name_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cas_transp_name_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__charge_cat_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__charge_cat_lkp (
    charge_cat_id integer NOT NULL,
    charge_cat_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__charge_cat_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__city_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__city_lkp (
    city_id integer NOT NULL,
    city_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__city_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cmv_cargo_body_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cmv_cargo_body_lkp (
    cmv_cargo_body_id integer NOT NULL,
    cmv_cargo_body_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cmv_cargo_body_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cmv_event_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cmv_event_lkp (
    cmv_event_id integer NOT NULL,
    cmv_event_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cmv_event_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cmv_road_acc_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cmv_road_acc_lkp (
    cmv_road_acc_id integer NOT NULL,
    cmv_road_acc_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cmv_road_acc_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cmv_trlr_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cmv_trlr_type_lkp (
    cmv_trlr_type_id integer NOT NULL,
    cmv_trlr_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cmv_trlr_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cmv_veh_oper_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cmv_veh_oper_lkp (
    cmv_veh_oper_id integer NOT NULL,
    cmv_veh_oper_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cmv_veh_oper_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__cmv_veh_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cmv_veh_type_lkp (
    cmv_veh_type_id integer NOT NULL,
    cmv_veh_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cmv_veh_type_lkp OWNER TO atd_vz_data;

--
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
-- Name: atd_txdot__cnty_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__cnty_lkp (
    cnty_id integer NOT NULL,
    cnty_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__cnty_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__collsn_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__collsn_lkp (
    collsn_id integer NOT NULL,
    collsn_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__collsn_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__contrib_factr_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__contrib_factr_lkp (
    contrib_factr_id integer NOT NULL,
    contrib_factr_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32),
    other character varying(32)
);


ALTER TABLE public.atd_txdot__contrib_factr_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__crash_sev_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__crash_sev_lkp (
    crash_sev_id integer NOT NULL,
    crash_sev_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__crash_sev_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__culvert_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__culvert_type_lkp (
    culvert_type_id integer NOT NULL,
    culvert_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__culvert_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__curb_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__curb_type_lkp (
    curb_type_id integer NOT NULL,
    curb_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__curb_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__curve_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__curve_type_lkp (
    curve_type_id integer NOT NULL,
    curve_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__curve_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__delta_left_right_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__delta_left_right_lkp (
    delta_left_right_id integer NOT NULL,
    delta_left_right_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__delta_left_right_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__drug_category_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__drug_category_lkp (
    drug_category_id integer NOT NULL,
    drug_category_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__drug_category_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__drvr_ethncty_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__drvr_ethncty_lkp (
    drvr_ethncty_id integer NOT NULL,
    drvr_ethncty_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__drvr_ethncty_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__drvr_lic_cls_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__drvr_lic_cls_lkp (
    drvr_lic_cls_id integer NOT NULL,
    drvr_lic_cls_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__drvr_lic_cls_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__drvr_lic_endors_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__drvr_lic_endors_lkp (
    drvr_lic_endors_id integer NOT NULL,
    drvr_lic_endors_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__drvr_lic_endors_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__drvr_lic_restric_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__drvr_lic_restric_lkp (
    drvr_lic_restric_id integer NOT NULL,
    drvr_lic_restric_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__drvr_lic_restric_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__drvr_lic_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__drvr_lic_type_lkp (
    drvr_lic_type_id integer NOT NULL,
    drvr_lic_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__drvr_lic_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__ejct_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__ejct_lkp (
    ejct_id integer NOT NULL,
    ejct_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__ejct_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__entr_road_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__entr_road_lkp (
    entr_road_id integer NOT NULL,
    entr_road_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__entr_road_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__est_comp_cost; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__est_comp_cost (
    est_comp_cost_id integer NOT NULL,
    est_comp_cost_desc character varying(64),
    est_comp_cost_amount numeric
);


ALTER TABLE public.atd_txdot__est_comp_cost OWNER TO atd_vz_data;

--
-- Name: atd_txdot__est_comp_cost_crash_based; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__est_comp_cost_crash_based (
    est_comp_cost_id integer NOT NULL,
    est_comp_cost_desc character varying,
    est_comp_cost_amount numeric(10,2)
);


ALTER TABLE public.atd_txdot__est_comp_cost_crash_based OWNER TO atd_vz_data;

--
-- Name: atd_txdot__est_comp_cost_crash_based_est_comp_cost_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot__est_comp_cost_crash_based_est_comp_cost_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot__est_comp_cost_crash_based_est_comp_cost_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot__est_comp_cost_crash_based_est_comp_cost_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot__est_comp_cost_crash_based_est_comp_cost_id_seq OWNED BY public.atd_txdot__est_comp_cost_crash_based.est_comp_cost_id;


--
-- Name: atd_txdot__est_econ_cost; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__est_econ_cost (
    est_econ_cost_id integer NOT NULL,
    est_econ_cost_desc character varying(64),
    est_econ_cost_amount numeric
);


ALTER TABLE public.atd_txdot__est_econ_cost OWNER TO atd_vz_data;

--
-- Name: atd_txdot__ethnicity_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__ethnicity_lkp (
    ethnicity_id integer NOT NULL,
    ethnicity_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__ethnicity_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__func_sys_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__func_sys_lkp (
    func_sys_id integer NOT NULL,
    func_sys_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__func_sys_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__gndr_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__gndr_lkp (
    gndr_id integer NOT NULL,
    gndr_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__gndr_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__harm_evnt_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__harm_evnt_lkp (
    harm_evnt_id integer NOT NULL,
    harm_evnt_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__harm_evnt_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__hazmat_cls_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__hazmat_cls_lkp (
    hazmat_cls_id integer NOT NULL,
    hazmat_cls_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__hazmat_cls_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__hazmat_idnbr_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__hazmat_idnbr_lkp (
    hazmat_idnbr_id integer NOT NULL,
    hazmat_idnbr_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__hazmat_idnbr_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__helmet_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__helmet_lkp (
    helmet_id integer NOT NULL,
    helmet_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__helmet_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__hwy_dsgn_hrt_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__hwy_dsgn_hrt_lkp (
    hwy_dsgn_hrt_id integer NOT NULL,
    hwy_dsgn_hrt_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__hwy_dsgn_hrt_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__hwy_dsgn_lane_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__hwy_dsgn_lane_lkp (
    hwy_dsgn_lane_id integer NOT NULL,
    hwy_dsgn_lane_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__hwy_dsgn_lane_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__hwy_sys_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__hwy_sys_lkp (
    hwy_sys_id integer NOT NULL,
    hwy_sys_short_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__hwy_sys_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__injry_sev_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__injry_sev_lkp (
    injry_sev_id integer NOT NULL,
    injry_sev_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__injry_sev_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__ins_co_name_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__ins_co_name_lkp (
    ins_co_name_id integer NOT NULL,
    ins_co_name_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__ins_co_name_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__ins_proof_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__ins_proof_lkp (
    ins_proof_id integer NOT NULL,
    ins_proof_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__ins_proof_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__ins_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__ins_type_lkp (
    ins_type_id integer NOT NULL,
    ins_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__ins_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__insurance_proof_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__insurance_proof_lkp (
    insurance_proof_id integer NOT NULL,
    insurance_proof_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__insurance_proof_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__insurance_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__insurance_type_lkp (
    insurance_type_id integer NOT NULL,
    insurance_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__insurance_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__intrsct_relat_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__intrsct_relat_lkp (
    intrsct_relat_id integer NOT NULL,
    intrsct_relat_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__intrsct_relat_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__inv_da_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__inv_da_lkp (
    inv_da_id integer NOT NULL,
    inv_da_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__inv_da_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__inv_notify_meth_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__inv_notify_meth_lkp (
    inv_notify_meth_id integer NOT NULL,
    inv_notify_meth_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__inv_notify_meth_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__inv_region_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__inv_region_lkp (
    inv_region_id integer NOT NULL,
    inv_region_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__inv_region_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__inv_service_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__inv_service_lkp (
    inv_service_id integer NOT NULL,
    inv_service_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__inv_service_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__light_cond_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__light_cond_lkp (
    light_cond_id integer NOT NULL,
    light_cond_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__light_cond_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__median_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__median_type_lkp (
    median_type_id integer NOT NULL,
    median_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__median_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__movt_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__movt_lkp (
    movement_id integer NOT NULL,
    movement_desc character varying(128)
);


ALTER TABLE public.atd_txdot__movt_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__mpo_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__mpo_lkp (
    mpo_id integer NOT NULL,
    mpo_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__mpo_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__nsew_dir_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__nsew_dir_lkp (
    nsew_dir_id integer NOT NULL,
    nsew_dir_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__nsew_dir_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__obj_struck_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__obj_struck_lkp (
    obj_struck_id integer NOT NULL,
    obj_struck_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__obj_struck_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__occpnt_pos_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__occpnt_pos_lkp (
    occpnt_pos_id integer NOT NULL,
    occpnt_pos_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__occpnt_pos_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__othr_factr_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__othr_factr_lkp (
    othr_factr_id integer NOT NULL,
    othr_factr_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__othr_factr_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__phys_featr_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__phys_featr_lkp (
    phys_featr_id integer NOT NULL,
    phys_featr_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__phys_featr_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__pop_group_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__pop_group_lkp (
    pop_group_id integer NOT NULL,
    pop_group_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__pop_group_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__poscrossing_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__poscrossing_lkp (
    poscrossing_id integer NOT NULL,
    poscrossing_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__poscrossing_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__prsn_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__prsn_type_lkp (
    prsn_type_id integer NOT NULL,
    prsn_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__prsn_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__ref_mark_nbr_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__ref_mark_nbr_lkp (
    ref_mark_nbr_id integer NOT NULL,
    ref_mark_nbr_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__ref_mark_nbr_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__rest_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__rest_lkp (
    rest_id integer NOT NULL,
    rest_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__rest_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__road_algn_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__road_algn_lkp (
    road_algn_id integer NOT NULL,
    road_algn_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__road_algn_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__road_cls_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__road_cls_lkp (
    road_cls_id integer NOT NULL,
    road_cls_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__road_cls_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__road_part_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__road_part_lkp (
    road_part_id integer NOT NULL,
    road_part_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__road_part_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__road_relat_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__road_relat_lkp (
    road_relat_id integer NOT NULL,
    road_relat_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__road_relat_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__road_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__road_type_lkp (
    road_type_id integer NOT NULL,
    road_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__road_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__rural_urban_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__rural_urban_lkp (
    rural_urban_id integer NOT NULL,
    rural_urban_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__rural_urban_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__rural_urban_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__rural_urban_type_lkp (
    rural_urban_type_id integer NOT NULL,
    rural_urban_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__rural_urban_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__rwy_sys_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__rwy_sys_lkp (
    rwy_sys_id integer NOT NULL,
    rwy_sys_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__rwy_sys_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__shldr_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__shldr_type_lkp (
    shldr_type_id integer NOT NULL,
    shldr_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__shldr_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__shldr_use_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__shldr_use_lkp (
    shldr_use_id integer NOT NULL,
    shldr_use_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__shldr_use_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__specimen_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__specimen_type_lkp (
    specimen_type_id integer NOT NULL,
    specimen_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__specimen_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__speed_mgmt_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__speed_mgmt_lkp (
    speed_mgmt_id integer NOT NULL,
    speed_mgmt_desc character varying(64),
    speed_mgmt_points numeric
);


ALTER TABLE public.atd_txdot__speed_mgmt_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__state_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__state_lkp (
    state_id integer NOT NULL,
    state_short_desc character varying(8),
    state_long_desc character varying(32),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__state_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__street_sfx_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__street_sfx_lkp (
    street_sfx_id integer NOT NULL,
    street_sfx_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__street_sfx_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__substnc_cat_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__substnc_cat_lkp (
    substnc_cat_id integer NOT NULL,
    substnc_cat_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__substnc_cat_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__substnc_tst_result_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__substnc_tst_result_lkp (
    substnc_tst_result_id integer NOT NULL,
    substnc_tst_result_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__substnc_tst_result_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__surf_cond_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__surf_cond_lkp (
    surf_cond_id integer NOT NULL,
    surf_cond_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__surf_cond_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__surf_type_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__surf_type_lkp (
    surf_type_id integer NOT NULL,
    surf_type_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__surf_type_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__traffic_cntl_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__traffic_cntl_lkp (
    traffic_cntl_id integer NOT NULL,
    traffic_cntl_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__traffic_cntl_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__trvl_dir_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__trvl_dir_lkp (
    trvl_dir_id integer NOT NULL,
    trvl_dir_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__trvl_dir_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__tst_result_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__tst_result_lkp (
    tst_result_id integer NOT NULL,
    tst_result_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__tst_result_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__unit_desc_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__unit_desc_lkp (
    unit_desc_id integer NOT NULL,
    unit_desc_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__unit_desc_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__unit_dfct_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__unit_dfct_lkp (
    unit_dfct_id integer NOT NULL,
    unit_dfct_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__unit_dfct_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__uom_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__uom_lkp (
    uom_id integer NOT NULL,
    uom_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__uom_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_body_styl_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_body_styl_lkp (
    veh_body_styl_id integer NOT NULL,
    veh_body_styl_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_body_styl_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_color_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_color_lkp (
    veh_color_id integer NOT NULL,
    veh_color_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_color_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_damage_description_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_damage_description_lkp (
    veh_damage_description_id integer NOT NULL,
    veh_damage_description_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_damage_description_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_damage_severity_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_damage_severity_lkp (
    veh_damage_severity_id integer NOT NULL,
    veh_damage_severity_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_damage_severity_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_direction_of_force_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_direction_of_force_lkp (
    veh_direction_of_force_id integer NOT NULL,
    veh_direction_of_force_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_direction_of_force_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_make_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_make_lkp (
    veh_make_id integer NOT NULL,
    veh_make_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_make_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_mod_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_mod_lkp (
    veh_mod_id integer NOT NULL,
    veh_mod_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_mod_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__veh_trvl_dir_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_trvl_dir_lkp (
    veh_trvl_dir_id integer NOT NULL,
    veh_trvl_dir_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_trvl_dir_lkp OWNER TO atd_vz_data;

--
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
-- Name: atd_txdot__veh_year_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__veh_year_lkp (
    veh_mod_year integer NOT NULL,
    veh_mod_year_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__veh_year_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__wdcode_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__wdcode_lkp (
    wdcode_id integer NOT NULL,
    wdcode_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__wdcode_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__wthr_cond_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__wthr_cond_lkp (
    wthr_cond_id integer NOT NULL,
    wthr_cond_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__wthr_cond_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__y_n_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__y_n_lkp (
    y_n_id character varying(1) NOT NULL,
    y_n_desc text
);


ALTER TABLE public.atd_txdot__y_n_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot__yes_no_choice_lkp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot__yes_no_choice_lkp (
    yes_no_choice_id integer NOT NULL,
    yes_no_choice_desc character varying(128),
    eff_beg_date character varying(32),
    eff_end_date character varying(32)
);


ALTER TABLE public.atd_txdot__yes_no_choice_lkp OWNER TO atd_vz_data;

--
-- Name: atd_txdot_change_log; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_change_log (
    change_log_id integer NOT NULL,
    record_id integer NOT NULL,
    record_crash_id integer,
    record_type character varying(32) NOT NULL,
    record_json json NOT NULL,
    update_timestamp timestamp without time zone DEFAULT now(),
    id integer,
    updated_by character varying(128)
);


ALTER TABLE public.atd_txdot_change_log OWNER TO atd_vz_data;

--
-- Name: atd_txdot_change_log_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_change_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_change_log_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_change_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_change_log_id_seq OWNED BY public.atd_txdot_change_log.change_log_id;


--
-- Name: atd_txdot_change_pending; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_change_pending (
    id integer NOT NULL,
    record_id integer NOT NULL,
    record_crash_id integer,
    record_type character varying(32) NOT NULL,
    record_json json NOT NULL,
    create_date timestamp without time zone DEFAULT now(),
    last_update timestamp without time zone DEFAULT now(),
    is_retired boolean DEFAULT true
);


ALTER TABLE public.atd_txdot_change_pending OWNER TO atd_vz_data;

--
-- Name: atd_txdot_change_pending_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_change_pending_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_change_pending_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_change_pending_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_change_pending_id_seq OWNED BY public.atd_txdot_change_pending.id;


--
-- Name: atd_txdot_change_status; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_change_status (
    change_status_id integer NOT NULL,
    description character varying(128) DEFAULT NULL::character varying,
    description_long text,
    last_update date DEFAULT now(),
    is_retired boolean DEFAULT false
);


ALTER TABLE public.atd_txdot_change_status OWNER TO atd_vz_data;

--
-- Name: atd_txdot_change_status_change_status_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_change_status_change_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_change_status_change_status_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_change_status_change_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_change_status_change_status_id_seq OWNED BY public.atd_txdot_change_status.change_status_id;


--
-- Name: atd_txdot_changes; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_changes (
    change_id integer NOT NULL,
    record_id integer NOT NULL,
    record_type character varying(32) NOT NULL,
    record_json json NOT NULL,
    update_timestamp timestamp without time zone DEFAULT now(),
    created_timestamp timestamp without time zone DEFAULT now(),
    updated_by character varying(128) DEFAULT 'System'::character varying,
    status_id integer DEFAULT 0 NOT NULL,
    affected_columns text,
    crash_date date,
    record_uqid integer NOT NULL
);


ALTER TABLE public.atd_txdot_changes OWNER TO atd_vz_data;

--
-- Name: atd_txdot_changes_change_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_changes_change_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_changes_change_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_changes_change_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_changes_change_id_seq OWNED BY public.atd_txdot_changes.change_id;


--
-- Name: atd_txdot_charges; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_charges (
    charge_id integer NOT NULL,
    crash_id integer DEFAULT 0 NOT NULL,
    unit_nbr integer DEFAULT 0 NOT NULL,
    prsn_nbr integer DEFAULT 0 NOT NULL,
    charge_cat_id integer DEFAULT 0 NOT NULL,
    charge text DEFAULT ''::text NOT NULL,
    citation_nbr character varying(32) DEFAULT ''::character varying NOT NULL,
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    is_retired boolean DEFAULT false NOT NULL
);


ALTER TABLE public.atd_txdot_charges OWNER TO atd_vz_data;

--
-- Name: atd_txdot_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_charges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_charges_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_charges_id_seq OWNED BY public.atd_txdot_charges.charge_id;


--
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
-- Name: atd_txdot_crash_locations; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_crash_locations (
    crash_location_id integer NOT NULL,
    crash_id integer NOT NULL,
    location_id character varying(32) NOT NULL,
    metadata json,
    comments text,
    last_update date DEFAULT now(),
    is_retired boolean DEFAULT false
);


ALTER TABLE public.atd_txdot_crash_locations OWNER TO atd_vz_data;

--
-- Name: atd_txdot_crash_locations_crash_location_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_crash_locations_crash_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_crash_locations_crash_location_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_crash_locations_crash_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_crash_locations_crash_location_id_seq OWNED BY public.atd_txdot_crash_locations.crash_location_id;


--
-- Name: atd_txdot_crash_locations_ranking; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.atd_txdot_crash_locations_ranking AS
 SELECT l.location_id,
    sum(1) AS crashes,
    sum(c.apd_confirmed_death_count) AS apd_confirmed_death_count,
    sum(c.sus_serious_injry_cnt) AS serious_injry_cnt
   FROM (public.atd_txdot_crash_locations l
     LEFT JOIN public.atd_txdot_crashes c ON ((c.crash_id = l.crash_id)))
  GROUP BY l.location_id
  ORDER BY (sum(c.sus_serious_injry_cnt)) DESC;


ALTER TABLE public.atd_txdot_crash_locations_ranking OWNER TO atd_vz_data;

--
-- Name: atd_txdot_crash_status; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_crash_status (
    crash_status_id integer NOT NULL,
    description character varying(128) DEFAULT NULL::character varying,
    description_long text,
    last_update date DEFAULT now(),
    is_retired boolean DEFAULT false
);


ALTER TABLE public.atd_txdot_crash_status OWNER TO atd_vz_data;

--
-- Name: atd_txdot_crash_status_crash_status_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_crash_status_crash_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_crash_status_crash_status_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_crash_status_crash_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_crash_status_crash_status_id_seq OWNED BY public.atd_txdot_crash_status.crash_status_id;


--
-- Name: atd_txdot_geocoders; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_geocoders (
    geocoder_id integer NOT NULL,
    name character varying,
    description text
);


ALTER TABLE public.atd_txdot_geocoders OWNER TO atd_vz_data;

--
-- Name: atd_txdot_geocoders_geocoder_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_geocoders_geocoder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_geocoders_geocoder_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_geocoders_geocoder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_geocoders_geocoder_id_seq OWNED BY public.atd_txdot_geocoders.geocoder_id;


--
-- Name: atd_txdot_locations_change_log; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_locations_change_log (
    change_log_id integer NOT NULL,
    location_id character varying(32),
    record_json json NOT NULL,
    update_timestamp timestamp without time zone DEFAULT now()
);


ALTER TABLE public.atd_txdot_locations_change_log OWNER TO atd_vz_data;

--
-- Name: atd_txdot_locations_change_log_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_locations_change_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_locations_change_log_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_locations_change_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_locations_change_log_id_seq OWNED BY public.atd_txdot_locations_change_log.change_log_id;


--
-- Name: atd_txdot_locations_with_centroids; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.atd_txdot_locations_with_centroids AS
 SELECT atd_txdot_locations.location_id,
    atd_txdot_locations.description,
    atd_txdot_locations.address,
    atd_txdot_locations.metadata,
    atd_txdot_locations.last_update,
    atd_txdot_locations.is_retired,
    atd_txdot_locations.is_studylocation,
    atd_txdot_locations.priority_level,
    atd_txdot_locations.shape,
    atd_txdot_locations.latitude,
    atd_txdot_locations.longitude,
    atd_txdot_locations.scale_factor,
    atd_txdot_locations.geometry,
    atd_txdot_locations.unique_id,
    atd_txdot_locations.asmp_street_level,
    atd_txdot_locations.road,
    atd_txdot_locations.intersection,
    atd_txdot_locations.spine,
    atd_txdot_locations.overlapping_geometry,
    atd_txdot_locations.intersection_union,
    atd_txdot_locations.broken_out_intersections_union,
    atd_txdot_locations.road_name,
    atd_txdot_locations.level_1,
    atd_txdot_locations.level_2,
    atd_txdot_locations.level_3,
    atd_txdot_locations.level_4,
    atd_txdot_locations.level_5,
    atd_txdot_locations.street_level,
    atd_txdot_locations.is_intersection,
    atd_txdot_locations.is_svrd,
    atd_txdot_locations.council_district,
    atd_txdot_locations.non_cr3_report_count,
    atd_txdot_locations.cr3_report_count,
    atd_txdot_locations.total_crash_count,
    atd_txdot_locations.total_comprehensive_cost,
    atd_txdot_locations.total_speed_mgmt_points,
    atd_txdot_locations.non_injury_count,
    atd_txdot_locations.unknown_injury_count,
    atd_txdot_locations.possible_injury_count,
    atd_txdot_locations.non_incapacitating_injury_count,
    atd_txdot_locations.suspected_serious_injury_count,
    atd_txdot_locations.death_count,
    atd_txdot_locations.crash_history_score,
    atd_txdot_locations.sidewalk_score,
    atd_txdot_locations.bicycle_score,
    atd_txdot_locations.transit_score,
    atd_txdot_locations.community_dest_score,
    atd_txdot_locations.minority_score,
    atd_txdot_locations.poverty_score,
    atd_txdot_locations.community_context_score,
    atd_txdot_locations.total_cc_and_history_score,
    atd_txdot_locations.is_intersecting_district,
    atd_txdot_locations.polygon_id,
    atd_txdot_locations.signal_engineer_area_id,
    atd_txdot_locations.development_engineer_area_id,
    atd_txdot_locations.polygon_hex_id,
    atd_txdot_locations.location_group,
    public.st_centroid(atd_txdot_locations.shape) AS centroid
   FROM public.atd_txdot_locations;


ALTER TABLE public.atd_txdot_locations_with_centroids OWNER TO atd_vz_data;

--
-- Name: atd_txdot_person; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_person (
    crash_id integer,
    unit_nbr integer,
    prsn_nbr integer,
    prsn_type_id integer,
    prsn_occpnt_pos_id integer,
    prsn_name_honorific character varying(32),
    prsn_last_name character varying(128),
    prsn_first_name character varying(128),
    prsn_mid_name character varying(128),
    prsn_name_sfx character varying(32),
    prsn_injry_sev_id integer,
    prsn_age integer,
    prsn_ethnicity_id integer DEFAULT 0,
    prsn_gndr_id integer,
    prsn_ejct_id integer,
    prsn_rest_id integer,
    prsn_airbag_id integer,
    prsn_helmet_id integer,
    prsn_sol_fl character varying(1),
    prsn_alc_spec_type_id integer,
    prsn_alc_rslt_id integer,
    prsn_bac_test_rslt character varying(64),
    prsn_drg_spec_type_id integer,
    prsn_drg_rslt_id integer,
    prsn_taken_to character varying(256),
    prsn_taken_by character varying(256),
    prsn_death_date date,
    prsn_death_time time without time zone,
    sus_serious_injry_cnt integer,
    nonincap_injry_cnt integer,
    poss_injry_cnt integer,
    non_injry_cnt integer,
    unkn_injry_cnt integer,
    tot_injry_cnt integer,
    death_cnt integer,
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    person_id integer NOT NULL,
    is_retired boolean DEFAULT false,
    years_of_life_lost integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.atd_txdot_person OWNER TO atd_vz_data;

--
-- Name: atd_txdot_person_person_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_person_person_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_person_person_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_person_person_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_person_person_id_seq OWNED BY public.atd_txdot_person.person_id;


--
-- Name: atd_txdot_primaryperson; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_primaryperson (
    crash_id integer,
    unit_nbr integer,
    prsn_nbr integer,
    prsn_type_id integer,
    prsn_occpnt_pos_id integer,
    prsn_name_honorific character varying(32),
    prsn_injry_sev_id integer,
    prsn_age integer,
    prsn_ethnicity_id integer,
    prsn_gndr_id integer,
    prsn_ejct_id integer,
    prsn_rest_id integer,
    prsn_airbag_id integer,
    prsn_helmet_id integer,
    prsn_sol_fl character varying(1),
    prsn_alc_spec_type_id integer,
    prsn_alc_rslt_id integer,
    prsn_bac_test_rslt character varying(64),
    prsn_drg_spec_type_id integer,
    prsn_drg_rslt_id integer,
    drvr_drg_cat_1_id integer,
    prsn_taken_to character varying(256),
    prsn_taken_by character varying(256),
    prsn_death_date date,
    prsn_death_time time without time zone,
    sus_serious_injry_cnt integer,
    nonincap_injry_cnt integer,
    poss_injry_cnt integer,
    non_injry_cnt integer,
    unkn_injry_cnt integer,
    tot_injry_cnt integer,
    death_cnt integer,
    drvr_lic_type_id integer,
    drvr_lic_cls_id integer,
    drvr_city_name character varying(128),
    drvr_state_id integer,
    drvr_zip character varying(16),
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    primaryperson_id integer NOT NULL,
    is_retired boolean DEFAULT false,
    years_of_life_lost integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.atd_txdot_primaryperson OWNER TO atd_vz_data;

--
-- Name: atd_txdot_primaryperson_primaryperson_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_primaryperson_primaryperson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_primaryperson_primaryperson_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_primaryperson_primaryperson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_primaryperson_primaryperson_id_seq OWNED BY public.atd_txdot_primaryperson.primaryperson_id;


--
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
    shape public.geometry(MultiLineString,4326)
);


ALTER TABLE public.atd_txdot_streets OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_units (
    crash_id integer,
    unit_nbr integer,
    unit_desc_id integer,
    veh_parked_fl character varying(1),
    veh_hnr_fl character varying(1),
    veh_lic_state_id integer,
    veh_lic_plate_nbr character varying(64),
    vin character varying(128),
    veh_mod_year integer,
    veh_color_id integer,
    veh_make_id integer,
    veh_mod_id integer,
    veh_body_styl_id integer,
    emer_respndr_fl character varying(1),
    owner_lessee character varying(32),
    ownr_mid_name character varying(128),
    ownr_name_sfx character varying(32),
    ownr_name_honorific character varying(32),
    ownr_city_name character varying(128),
    ownr_state_id integer,
    ownr_zip character varying(16),
    fin_resp_proof_id integer,
    fin_resp_type_id integer,
    fin_resp_name character varying(128),
    fin_resp_policy_nbr character varying(128),
    fin_resp_phone_nbr character varying(128),
    veh_inventoried_fl character varying(1),
    veh_transp_name character varying(128),
    veh_transp_dest character varying(256),
    veh_cmv_fl character varying(1),
    cmv_fiveton_fl character varying(32),
    cmv_hazmat_fl character varying(32),
    cmv_nine_plus_pass_fl character varying(32),
    cmv_veh_oper_id integer,
    cmv_carrier_id_type_id integer,
    cmv_carrier_id_nbr text,
    cmv_carrier_corp_name character varying(64),
    cmv_carrier_street_pfx character varying(64),
    cmv_carrier_street_nbr character varying(64),
    cmv_carrier_street_name character varying(128),
    cmv_carrier_street_sfx character varying(32),
    cmv_carrier_po_box character varying(128),
    cmv_carrier_city_name character varying(128),
    cmv_carrier_state_id integer,
    cmv_carrier_zip character varying(16),
    cmv_road_acc_id integer,
    cmv_veh_type_id integer,
    cmv_gvwr text,
    cmv_rgvw character varying(64),
    cmv_hazmat_rel_fl character varying(64),
    hazmat_cls_1_id integer,
    hazmat_idnbr_1_id integer,
    hazmat_cls_2_id integer,
    hazmat_idnbr_2_id integer,
    cmv_cargo_body_id integer,
    trlr1_gvwr character varying(64),
    trlr1_rgvw character varying(64),
    trlr1_type_id integer,
    trlr2_gvwr character varying(64),
    trlr2_rgvw character varying(64),
    trlr2_type_id integer,
    cmv_evnt1_id integer,
    cmv_evnt2_id integer,
    cmv_evnt3_id integer,
    cmv_evnt4_id integer,
    cmv_tot_axle character varying(64),
    cmv_tot_tire character varying(64),
    contrib_factr_1_id integer,
    contrib_factr_2_id integer,
    contrib_factr_3_id integer,
    contrib_factr_p1_id integer,
    contrib_factr_p2_id integer,
    veh_dfct_1_id integer,
    veh_dfct_2_id integer,
    veh_dfct_3_id integer,
    veh_dfct_p1_id integer,
    veh_dfct_p2_id integer,
    veh_trvl_dir_id integer,
    first_harm_evt_inv_id integer,
    sus_serious_injry_cnt integer DEFAULT 0 NOT NULL,
    nonincap_injry_cnt integer DEFAULT 0 NOT NULL,
    poss_injry_cnt integer DEFAULT 0 NOT NULL,
    non_injry_cnt integer DEFAULT 0 NOT NULL,
    unkn_injry_cnt integer DEFAULT 0 NOT NULL,
    tot_injry_cnt integer DEFAULT 0 NOT NULL,
    death_cnt integer DEFAULT 0 NOT NULL,
    cmv_disabling_damage_fl character varying(64),
    cmv_trlr1_disabling_dmag_id integer,
    cmv_trlr2_disabling_dmag_id integer,
    cmv_bus_type_id integer,
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    unit_id integer NOT NULL,
    is_retired boolean DEFAULT false,
    atd_mode_category integer DEFAULT 0,
    travel_direction integer,
    movement_id integer,
    veh_damage_description1_id integer,
    veh_damage_severity1_id integer,
    veh_damage_direction_of_force1_id integer,
    veh_damage_description2_id integer,
    veh_damage_severity2_id integer,
    veh_damage_direction_of_force2_id integer,
    force_dir_2_id integer,
    veh_dmag_scl_2_id integer,
    veh_dmag_area_2_id integer,
    force_dir_1_id integer,
    veh_dmag_scl_1_id integer,
    veh_dmag_area_1_id integer,
    autonomous_unit_id integer,
    pedestrian_action_id integer,
    pedalcyclist_action_id integer,
    pbcat_pedestrian_id integer,
    pbcat_pedalcyclist_id integer,
    e_scooter_id integer
);


ALTER TABLE public.atd_txdot_units OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units_temp; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.atd_txdot_units_temp (
    crash_id integer,
    unit_nbr integer,
    unit_desc_id integer,
    veh_parked_fl character varying(1),
    veh_hnr_fl character varying(1),
    veh_lic_state_id integer,
    veh_lic_plate_nbr character varying(64),
    vin character varying(128),
    veh_mod_year integer,
    veh_color_id integer,
    veh_make_id integer,
    veh_mod_id integer,
    veh_body_styl_id integer,
    emer_respndr_fl character varying(1),
    owner_lessee character varying(32),
    ownr_mid_name character varying(128),
    ownr_name_sfx character varying(32),
    ownr_name_honorific character varying(32),
    ownr_city_name character varying(128),
    ownr_state_id integer,
    ownr_zip character varying(16),
    fin_resp_proof_id integer,
    fin_resp_type_id integer,
    fin_resp_name character varying(128),
    fin_resp_policy_nbr character varying(128),
    fin_resp_phone_nbr character varying(128),
    veh_dmag_area_1_id integer,
    veh_dmag_scl_1_id integer,
    force_dir_1_id integer,
    veh_dmag_area_2_id integer,
    veh_dmag_scl_2_id integer,
    force_dir_2_id integer,
    veh_inventoried_fl character varying(1),
    veh_transp_name character varying(128),
    veh_transp_dest character varying(256),
    veh_cmv_fl character varying(1),
    cmv_fiveton_fl character varying(32),
    cmv_hazmat_fl character varying(32),
    cmv_nine_plus_pass_fl character varying(32),
    cmv_veh_oper_id integer,
    cmv_carrier_id_type_id integer,
    cmv_carrier_id_nbr text,
    cmv_carrier_corp_name character varying(64),
    cmv_carrier_street_pfx character varying(64),
    cmv_carrier_street_nbr character varying(64),
    cmv_carrier_street_name character varying(128),
    cmv_carrier_street_sfx character varying(32),
    cmv_carrier_po_box character varying(128),
    cmv_carrier_city_name character varying(128),
    cmv_carrier_state_id integer,
    cmv_carrier_zip character varying(16),
    cmv_road_acc_id integer,
    cmv_veh_type_id integer,
    cmv_gvwr text,
    cmv_rgvw character varying(64),
    cmv_hazmat_rel_fl character varying(64),
    hazmat_cls_1_id integer,
    hazmat_idnbr_1_id integer,
    hazmat_cls_2_id integer,
    hazmat_idnbr_2_id integer,
    cmv_cargo_body_id integer,
    trlr1_gvwr character varying(64),
    trlr1_rgvw character varying(64),
    trlr1_type_id integer,
    trlr2_gvwr character varying(64),
    trlr2_rgvw character varying(64),
    trlr2_type_id integer,
    cmv_evnt1_id integer,
    cmv_evnt2_id integer,
    cmv_evnt3_id integer,
    cmv_evnt4_id integer,
    cmv_tot_axle character varying(64),
    cmv_tot_tire character varying(64),
    contrib_factr_1_id integer,
    contrib_factr_2_id integer,
    contrib_factr_3_id integer,
    contrib_factr_p1_id integer,
    contrib_factr_p2_id integer,
    veh_dfct_1_id integer,
    veh_dfct_2_id integer,
    veh_dfct_3_id integer,
    veh_dfct_p1_id integer,
    veh_dfct_p2_id integer,
    veh_trvl_dir_id integer,
    first_harm_evt_inv_id integer,
    sus_serious_injry_cnt integer DEFAULT 0 NOT NULL,
    nonincap_injry_cnt integer DEFAULT 0 NOT NULL,
    poss_injry_cnt integer DEFAULT 0 NOT NULL,
    non_injry_cnt integer DEFAULT 0 NOT NULL,
    unkn_injry_cnt integer DEFAULT 0 NOT NULL,
    tot_injry_cnt integer DEFAULT 0 NOT NULL,
    death_cnt integer DEFAULT 0 NOT NULL,
    cmv_disabling_damage_fl character varying(64),
    cmv_trlr1_disabling_dmag_id integer,
    cmv_trlr2_disabling_dmag_id integer,
    cmv_bus_type_id integer,
    last_update timestamp without time zone DEFAULT now(),
    updated_by character varying(64),
    unit_id integer NOT NULL,
    is_retired boolean DEFAULT false,
    atd_mode_category integer DEFAULT 0,
    travel_direction integer,
    movement_id integer,
    veh_damage_description1_id integer,
    veh_damage_severity1_id integer,
    veh_damage_direction_of_force1_id integer,
    veh_damage_description2_id integer,
    veh_damage_severity2_id integer,
    veh_damage_direction_of_force2_id integer
);


ALTER TABLE public.atd_txdot_units_temp OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units_temp_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_units_temp_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_units_temp_unit_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units_temp_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_units_temp_unit_id_seq OWNED BY public.atd_txdot_units_temp.unit_id;


--
-- Name: atd_txdot_units_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.atd_txdot_units_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.atd_txdot_units_unit_id_seq OWNER TO atd_vz_data;

--
-- Name: atd_txdot_units_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.atd_txdot_units_unit_id_seq OWNED BY public.atd_txdot_units.unit_id;


--
-- Name: costs_list; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.costs_list (
    "array" numeric[]
);


ALTER TABLE public.costs_list OWNER TO atd_vz_data;

--
-- Name: council_districts; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.council_districts (
    gid integer NOT NULL,
    objectid bigint,
    single_mem bigint,
    created_da date,
    created_by character varying(20),
    modified_d date,
    modified_b character varying(20),
    council_di integer,
    council__1 character varying(100),
    shape__are numeric,
    shape__len numeric,
    geometry public.geometry(MultiPolygon,4326)
);


ALTER TABLE public.council_districts OWNER TO atd_vz_data;

--
-- Name: council_districts_gid_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.council_districts_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.council_districts_gid_seq OWNER TO atd_vz_data;

--
-- Name: council_districts_gid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.council_districts_gid_seq OWNED BY public.council_districts.gid;


--
-- Name: cr3_nonproper_crashes_on_mainlane; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.cr3_nonproper_crashes_on_mainlane AS
 WITH cr3_mainlanes AS (
         SELECT public.st_transform(public.st_buffer(public.st_transform(public.st_union(cr3_mainlanes.geometry), 2277), (1)::double precision), 4326) AS geometry
           FROM public.cr3_mainlanes
        ), seek_direction AS (
         SELECT c_1.crash_id,
                CASE
                    WHEN (("substring"(lower((c_1.rpt_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 'w'::text) OR ("substring"(lower((c_1.rpt_sec_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 'w'::text)) THEN 0
                    WHEN (("substring"(lower((c_1.rpt_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 'n'::text) OR ("substring"(lower((c_1.rpt_sec_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 'n'::text)) THEN 90
                    WHEN (("substring"(lower((c_1.rpt_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 'e'::text) OR ("substring"(lower((c_1.rpt_sec_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 'e'::text)) THEN 180
                    WHEN (("substring"(lower((c_1.rpt_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 's'::text) OR ("substring"(lower((c_1.rpt_sec_street_name)::text), '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) ~* 's'::text)) THEN 270
                    ELSE NULL::integer
                END AS seek_direction
           FROM public.atd_txdot_crashes c_1
        )
 SELECT c.crash_id,
    c.crash_fatal_fl,
    c.cmv_involv_fl,
    c.schl_bus_fl,
    c.rr_relat_fl,
    c.medical_advisory_fl,
    c.amend_supp_fl,
    c.active_school_zone_fl,
    c.crash_date,
    c.crash_time,
    c.case_id,
    c.local_use,
    c.rpt_cris_cnty_id,
    c.rpt_city_id,
    c.rpt_outside_city_limit_fl,
    c.thousand_damage_fl,
    c.rpt_latitude,
    c.rpt_longitude,
    c.rpt_rdwy_sys_id,
    c.rpt_hwy_num,
    c.rpt_hwy_sfx,
    c.rpt_road_part_id,
    c.rpt_block_num,
    c.rpt_street_pfx,
    c.rpt_street_name,
    c.rpt_street_sfx,
    c.private_dr_fl,
    c.toll_road_fl,
    c.crash_speed_limit,
    c.road_constr_zone_fl,
    c.road_constr_zone_wrkr_fl,
    c.rpt_street_desc,
    c.at_intrsct_fl,
    c.rpt_sec_rdwy_sys_id,
    c.rpt_sec_hwy_num,
    c.rpt_sec_hwy_sfx,
    c.rpt_sec_road_part_id,
    c.rpt_sec_block_num,
    c.rpt_sec_street_pfx,
    c.rpt_sec_street_name,
    c.rpt_sec_street_sfx,
    c.rpt_ref_mark_offset_amt,
    c.rpt_ref_mark_dist_uom,
    c.rpt_ref_mark_dir,
    c.rpt_ref_mark_nbr,
    c.rpt_sec_street_desc,
    c.rpt_crossingnumber,
    c.wthr_cond_id,
    c.light_cond_id,
    c.entr_road_id,
    c.road_type_id,
    c.road_algn_id,
    c.surf_cond_id,
    c.traffic_cntl_id,
    c.investigat_notify_time,
    c.investigat_notify_meth,
    c.investigat_arrv_time,
    c.report_date,
    c.investigat_comp_fl,
    c.investigator_name,
    c.id_number,
    c.ori_number,
    c.investigat_agency_id,
    c.investigat_area_id,
    c.investigat_district_id,
    c.investigat_region_id,
    c.bridge_detail_id,
    c.harm_evnt_id,
    c.intrsct_relat_id,
    c.fhe_collsn_id,
    c.obj_struck_id,
    c.othr_factr_id,
    c.road_part_adj_id,
    c.road_cls_id,
    c.road_relat_id,
    c.phys_featr_1_id,
    c.phys_featr_2_id,
    c.cnty_id,
    c.city_id,
    c.latitude,
    c.longitude,
    c.hwy_sys,
    c.hwy_nbr,
    c.hwy_sfx,
    c.dfo,
    c.street_name,
    c.street_nbr,
    c.control,
    c.section,
    c.milepoint,
    c.ref_mark_nbr,
    c.ref_mark_displ,
    c.hwy_sys_2,
    c.hwy_nbr_2,
    c.hwy_sfx_2,
    c.street_name_2,
    c.street_nbr_2,
    c.control_2,
    c.section_2,
    c.milepoint_2,
    c.txdot_rptable_fl,
    c.onsys_fl,
    c.rural_fl,
    c.crash_sev_id,
    c.pop_group_id,
    c.located_fl,
    c.day_of_week,
    c.hwy_dsgn_lane_id,
    c.hwy_dsgn_hrt_id,
    c.hp_shldr_left,
    c.hp_shldr_right,
    c.hp_median_width,
    c.base_type_id,
    c.nbr_of_lane,
    c.row_width_usual,
    c.roadbed_width,
    c.surf_width,
    c.surf_type_id,
    c.curb_type_left_id,
    c.curb_type_right_id,
    c.shldr_type_left_id,
    c.shldr_width_left,
    c.shldr_use_left_id,
    c.shldr_type_right_id,
    c.shldr_width_right,
    c.shldr_use_right_id,
    c.median_type_id,
    c.median_width,
    c.rural_urban_type_id,
    c.func_sys_id,
    c.adt_curnt_amt,
    c.adt_curnt_year,
    c.adt_adj_curnt_amt,
    c.pct_single_trk_adt,
    c.pct_combo_trk_adt,
    c.trk_aadt_pct,
    c.curve_type_id,
    c.curve_lngth,
    c.cd_degr,
    c.delta_left_right_id,
    c.dd_degr,
    c.feature_crossed,
    c.structure_number,
    c.i_r_min_vert_clear,
    c.approach_width,
    c.bridge_median_id,
    c.bridge_loading_type_id,
    c.bridge_loading_in_1000_lbs,
    c.bridge_srvc_type_on_id,
    c.bridge_srvc_type_under_id,
    c.culvert_type_id,
    c.roadway_width,
    c.deck_width,
    c.bridge_dir_of_traffic_id,
    c.bridge_rte_struct_func_id,
    c.bridge_ir_struct_func_id,
    c.crossingnumber,
    c.rrco,
    c.poscrossing_id,
    c.wdcode_id,
    c.standstop,
    c.yield,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt,
    c.mpo_id,
    c.investigat_service_id,
    c.investigat_da_id,
    c.investigator_narrative,
    c.geocoded,
    c.geocode_status,
    c.latitude_geocoded,
    c.longitude_geocoded,
    c.latitude_primary,
    c.longitude_primary,
    c.geocode_date,
    c.geocode_provider,
    c.qa_status,
    c.last_update,
    c.approval_date,
    c.approved_by,
    c.is_retired,
    c.updated_by,
    c.address_confirmed_primary,
    c.address_confirmed_secondary,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.apd_confirmed_fatality,
    c.apd_confirmed_death_count,
    c.micromobility_device_flag,
    c.cr3_stored_flag,
    c.apd_human_update,
    c.speed_mgmt_points,
    c.geocode_match_quality,
    c.geocode_match_metadata,
    c.atd_mode_category_metadata,
    c.location_id,
    c.changes_approved_date,
    c.austin_full_purpose,
    c.original_city_id,
    c.atd_fatality_count,
    c.temp_record,
    c.cr3_file_metadata,
    c.cr3_ocr_extraction_date,
    c.investigator_narrative_ocr,
    c.est_comp_cost_crash_based,
        CASE
            WHEN (((c.rpt_street_name)::text ~* '\s?([nsew])[arthous]*\s??b(oun)?d?'::text) OR ((c.rpt_sec_street_name)::text ~* '\s?([nsew])[arthous]*\s??b(oun)?d?'::text)) THEN true
            ELSE false
        END AS has_directionality,
    d.seek_direction,
    ( SELECT p.location_id
           FROM public.atd_txdot_locations p
          WHERE (
                CASE
                    WHEN (
                    CASE
                        WHEN ((d.seek_direction - 65) < 0) THEN ((d.seek_direction - 65) + 360)
                        ELSE (d.seek_direction - 65)
                    END < ((d.seek_direction + 65) % 360)) THEN ((((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) >= (
                    CASE
                        WHEN ((d.seek_direction - 65) < 0) THEN ((d.seek_direction - 65) + 360)
                        ELSE (d.seek_direction - 65)
                    END)::double precision) AND (((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) <= (((d.seek_direction + 65) % 360))::double precision))
                    ELSE ((((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) >= (
                    CASE
                        WHEN ((d.seek_direction - 65) < 0) THEN ((d.seek_direction - 65) + 360)
                        ELSE (d.seek_direction - 65)
                    END)::double precision) OR (((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) <= (((d.seek_direction + 65) % 360))::double precision))
                END AND public.st_intersects(public.st_transform(public.st_buffer(public.st_transform(c."position", 2277), (750)::double precision), 4326), p.shape) AND (p.description ~~* '%SVRD%'::text))
          ORDER BY (public.st_distance(public.st_centroid(p.shape), c."position"))
         LIMIT 1) AS surface_street_polygon,
    public.st_makeline(public.st_centroid(( SELECT p.shape
           FROM public.atd_txdot_locations p
          WHERE (
                CASE
                    WHEN (
                    CASE
                        WHEN ((d.seek_direction - 65) < 0) THEN ((d.seek_direction - 65) + 360)
                        ELSE (d.seek_direction - 65)
                    END < ((d.seek_direction + 65) % 360)) THEN ((((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) >= (
                    CASE
                        WHEN ((d.seek_direction - 65) < 0) THEN ((d.seek_direction - 65) + 360)
                        ELSE (d.seek_direction - 65)
                    END)::double precision) AND (((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) <= (((d.seek_direction + 65) % 360))::double precision))
                    ELSE ((((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) >= (
                    CASE
                        WHEN ((d.seek_direction - 65) < 0) THEN ((d.seek_direction - 65) + 360)
                        ELSE (d.seek_direction - 65)
                    END)::double precision) OR (((public.st_azimuth(c."position", public.st_centroid(p.shape)) * (180)::double precision) / pi()) <= (((d.seek_direction + 65) % 360))::double precision))
                END AND public.st_intersects(public.st_transform(public.st_buffer(public.st_transform(c."position", 2277), (750)::double precision), 4326), p.shape) AND (p.description ~~* '%SVRD%'::text))
          ORDER BY (public.st_distance(public.st_centroid(p.shape), c."position"))
         LIMIT 1)), c."position") AS visualization
   FROM public.atd_txdot_crashes c,
    cr3_mainlanes l,
    (seek_direction d
     JOIN public.atd_jurisdictions aj ON ((aj.id = 5)))
  WHERE ((1 = 1) AND (d.crash_id = c.crash_id) AND public.st_contains(aj.geometry, c."position") AND ((c.private_dr_fl)::text = 'N'::text) AND (c.rpt_road_part_id = ANY (ARRAY[2, 3, 4, 5, 7])) AND public.st_contains(l.geometry, c."position"));


ALTER TABLE public.cr3_nonproper_crashes_on_mainlane OWNER TO atd_vz_data;

--
-- Name: five_year_atd_apd_blueform; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_atd_apd_blueform AS
 SELECT c.form_id,
    c.date,
    c.case_id,
    c.address,
    c.longitude,
    c.latitude,
    c.hour,
    c.location_id,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    p.location_id AS surface_polygon_hex_id
   FROM (public.atd_apd_blueform c
     LEFT JOIN public.atd_txdot_locations p ON (((p.location_group = 1) AND (c."position" OPERATOR(public.&&) p.geometry) AND public.st_contains(p.geometry, c."position"))))
  WHERE ((c.date >= '2015-10-30'::date) AND (c.date < '2020-10-30'::date))
  WITH NO DATA;


ALTER TABLE public.five_year_atd_apd_blueform OWNER TO atd_vz_data;

--
-- Name: five_year_atd_txdot_crashes; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_atd_txdot_crashes AS
 SELECT c.crash_id,
    c.crash_fatal_fl,
    c.cmv_involv_fl,
    c.schl_bus_fl,
    c.rr_relat_fl,
    c.medical_advisory_fl,
    c.amend_supp_fl,
    c.active_school_zone_fl,
    c.crash_date,
    c.crash_time,
    c.case_id,
    c.local_use,
    c.rpt_cris_cnty_id,
    c.rpt_city_id,
    c.rpt_outside_city_limit_fl,
    c.thousand_damage_fl,
    c.rpt_latitude,
    c.rpt_longitude,
    c.rpt_rdwy_sys_id,
    c.rpt_hwy_num,
    c.rpt_hwy_sfx,
    c.rpt_road_part_id,
    c.rpt_block_num,
    c.rpt_street_pfx,
    c.rpt_street_name,
    c.rpt_street_sfx,
    c.private_dr_fl,
    c.toll_road_fl,
    c.crash_speed_limit,
    c.road_constr_zone_fl,
    c.road_constr_zone_wrkr_fl,
    c.rpt_street_desc,
    c.at_intrsct_fl,
    c.rpt_sec_rdwy_sys_id,
    c.rpt_sec_hwy_num,
    c.rpt_sec_hwy_sfx,
    c.rpt_sec_road_part_id,
    c.rpt_sec_block_num,
    c.rpt_sec_street_pfx,
    c.rpt_sec_street_name,
    c.rpt_sec_street_sfx,
    c.rpt_ref_mark_offset_amt,
    c.rpt_ref_mark_dist_uom,
    c.rpt_ref_mark_dir,
    c.rpt_ref_mark_nbr,
    c.rpt_sec_street_desc,
    c.rpt_crossingnumber,
    c.wthr_cond_id,
    c.light_cond_id,
    c.entr_road_id,
    c.road_type_id,
    c.road_algn_id,
    c.surf_cond_id,
    c.traffic_cntl_id,
    c.investigat_notify_time,
    c.investigat_notify_meth,
    c.investigat_arrv_time,
    c.report_date,
    c.investigat_comp_fl,
    c.investigator_name,
    c.id_number,
    c.ori_number,
    c.investigat_agency_id,
    c.investigat_area_id,
    c.investigat_district_id,
    c.investigat_region_id,
    c.bridge_detail_id,
    c.harm_evnt_id,
    c.intrsct_relat_id,
    c.fhe_collsn_id,
    c.obj_struck_id,
    c.othr_factr_id,
    c.road_part_adj_id,
    c.road_cls_id,
    c.road_relat_id,
    c.phys_featr_1_id,
    c.phys_featr_2_id,
    c.cnty_id,
    c.city_id,
    c.latitude,
    c.longitude,
    c.hwy_sys,
    c.hwy_nbr,
    c.hwy_sfx,
    c.dfo,
    c.street_name,
    c.street_nbr,
    c.control,
    c.section,
    c.milepoint,
    c.ref_mark_nbr,
    c.ref_mark_displ,
    c.hwy_sys_2,
    c.hwy_nbr_2,
    c.hwy_sfx_2,
    c.street_name_2,
    c.street_nbr_2,
    c.control_2,
    c.section_2,
    c.milepoint_2,
    c.txdot_rptable_fl,
    c.onsys_fl,
    c.rural_fl,
    c.crash_sev_id,
    c.pop_group_id,
    c.located_fl,
    c.day_of_week,
    c.hwy_dsgn_lane_id,
    c.hwy_dsgn_hrt_id,
    c.hp_shldr_left,
    c.hp_shldr_right,
    c.hp_median_width,
    c.base_type_id,
    c.nbr_of_lane,
    c.row_width_usual,
    c.roadbed_width,
    c.surf_width,
    c.surf_type_id,
    c.curb_type_left_id,
    c.curb_type_right_id,
    c.shldr_type_left_id,
    c.shldr_width_left,
    c.shldr_use_left_id,
    c.shldr_type_right_id,
    c.shldr_width_right,
    c.shldr_use_right_id,
    c.median_type_id,
    c.median_width,
    c.rural_urban_type_id,
    c.func_sys_id,
    c.adt_curnt_amt,
    c.adt_curnt_year,
    c.adt_adj_curnt_amt,
    c.pct_single_trk_adt,
    c.pct_combo_trk_adt,
    c.trk_aadt_pct,
    c.curve_type_id,
    c.curve_lngth,
    c.cd_degr,
    c.delta_left_right_id,
    c.dd_degr,
    c.feature_crossed,
    c.structure_number,
    c.i_r_min_vert_clear,
    c.approach_width,
    c.bridge_median_id,
    c.bridge_loading_type_id,
    c.bridge_loading_in_1000_lbs,
    c.bridge_srvc_type_on_id,
    c.bridge_srvc_type_under_id,
    c.culvert_type_id,
    c.roadway_width,
    c.deck_width,
    c.bridge_dir_of_traffic_id,
    c.bridge_rte_struct_func_id,
    c.bridge_ir_struct_func_id,
    c.crossingnumber,
    c.rrco,
    c.poscrossing_id,
    c.wdcode_id,
    c.standstop,
    c.yield,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt,
    c.mpo_id,
    c.investigat_service_id,
    c.investigat_da_id,
    c.investigator_narrative,
    c.geocoded,
    c.geocode_status,
    c.latitude_geocoded,
    c.longitude_geocoded,
    c.latitude_primary,
    c.longitude_primary,
    c.geocode_date,
    c.geocode_provider,
    c.qa_status,
    c.last_update,
    c.approval_date,
    c.approved_by,
    c.is_retired,
    c.updated_by,
    c.address_confirmed_primary,
    c.address_confirmed_secondary,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.apd_confirmed_fatality,
    c.apd_confirmed_death_count,
    c.micromobility_device_flag,
    c.cr3_stored_flag,
    c.apd_human_update,
    c.speed_mgmt_points,
    c.geocode_match_quality,
    c.geocode_match_metadata,
    c.atd_mode_category_metadata,
    c.location_id,
    c.changes_approved_date,
    c.austin_full_purpose,
    c.original_city_id,
    c.atd_fatality_count,
    c.temp_record,
    c.cr3_file_metadata,
    c.cr3_ocr_extraction_date,
    p.location_id AS surface_polygon_hex_id
   FROM (public.atd_txdot_crashes c
     LEFT JOIN public.atd_txdot_locations p ON (((p.location_group = 1) AND (c."position" OPERATOR(public.&&) p.geometry) AND public.st_contains(p.geometry, c."position"))))
  WHERE ((c.crash_date >= '2015-10-30'::date) AND (c.crash_date < '2020-10-30'::date))
  WITH NO DATA;


ALTER TABLE public.five_year_atd_txdot_crashes OWNER TO atd_vz_data;

--
-- Name: five_year_cr3_crashes_off_mainlane; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_cr3_crashes_off_mainlane AS
 WITH cr3_mainlanes AS (
         SELECT public.st_transform(public.st_buffer(public.st_transform(public.st_union(cr3_mainlanes.geometry), 2277), (1)::double precision), 4326) AS geometry
           FROM public.cr3_mainlanes
        )
 SELECT c.crash_id,
    c.crash_fatal_fl,
    c.cmv_involv_fl,
    c.schl_bus_fl,
    c.rr_relat_fl,
    c.medical_advisory_fl,
    c.amend_supp_fl,
    c.active_school_zone_fl,
    c.crash_date,
    c.crash_time,
    c.case_id,
    c.local_use,
    c.rpt_cris_cnty_id,
    c.rpt_city_id,
    c.rpt_outside_city_limit_fl,
    c.thousand_damage_fl,
    c.rpt_latitude,
    c.rpt_longitude,
    c.rpt_rdwy_sys_id,
    c.rpt_hwy_num,
    c.rpt_hwy_sfx,
    c.rpt_road_part_id,
    c.rpt_block_num,
    c.rpt_street_pfx,
    c.rpt_street_name,
    c.rpt_street_sfx,
    c.private_dr_fl,
    c.toll_road_fl,
    c.crash_speed_limit,
    c.road_constr_zone_fl,
    c.road_constr_zone_wrkr_fl,
    c.rpt_street_desc,
    c.at_intrsct_fl,
    c.rpt_sec_rdwy_sys_id,
    c.rpt_sec_hwy_num,
    c.rpt_sec_hwy_sfx,
    c.rpt_sec_road_part_id,
    c.rpt_sec_block_num,
    c.rpt_sec_street_pfx,
    c.rpt_sec_street_name,
    c.rpt_sec_street_sfx,
    c.rpt_ref_mark_offset_amt,
    c.rpt_ref_mark_dist_uom,
    c.rpt_ref_mark_dir,
    c.rpt_ref_mark_nbr,
    c.rpt_sec_street_desc,
    c.rpt_crossingnumber,
    c.wthr_cond_id,
    c.light_cond_id,
    c.entr_road_id,
    c.road_type_id,
    c.road_algn_id,
    c.surf_cond_id,
    c.traffic_cntl_id,
    c.investigat_notify_time,
    c.investigat_notify_meth,
    c.investigat_arrv_time,
    c.report_date,
    c.investigat_comp_fl,
    c.investigator_name,
    c.id_number,
    c.ori_number,
    c.investigat_agency_id,
    c.investigat_area_id,
    c.investigat_district_id,
    c.investigat_region_id,
    c.bridge_detail_id,
    c.harm_evnt_id,
    c.intrsct_relat_id,
    c.fhe_collsn_id,
    c.obj_struck_id,
    c.othr_factr_id,
    c.road_part_adj_id,
    c.road_cls_id,
    c.road_relat_id,
    c.phys_featr_1_id,
    c.phys_featr_2_id,
    c.cnty_id,
    c.city_id,
    c.latitude,
    c.longitude,
    c.hwy_sys,
    c.hwy_nbr,
    c.hwy_sfx,
    c.dfo,
    c.street_name,
    c.street_nbr,
    c.control,
    c.section,
    c.milepoint,
    c.ref_mark_nbr,
    c.ref_mark_displ,
    c.hwy_sys_2,
    c.hwy_nbr_2,
    c.hwy_sfx_2,
    c.street_name_2,
    c.street_nbr_2,
    c.control_2,
    c.section_2,
    c.milepoint_2,
    c.txdot_rptable_fl,
    c.onsys_fl,
    c.rural_fl,
    c.crash_sev_id,
    c.pop_group_id,
    c.located_fl,
    c.day_of_week,
    c.hwy_dsgn_lane_id,
    c.hwy_dsgn_hrt_id,
    c.hp_shldr_left,
    c.hp_shldr_right,
    c.hp_median_width,
    c.base_type_id,
    c.nbr_of_lane,
    c.row_width_usual,
    c.roadbed_width,
    c.surf_width,
    c.surf_type_id,
    c.curb_type_left_id,
    c.curb_type_right_id,
    c.shldr_type_left_id,
    c.shldr_width_left,
    c.shldr_use_left_id,
    c.shldr_type_right_id,
    c.shldr_width_right,
    c.shldr_use_right_id,
    c.median_type_id,
    c.median_width,
    c.rural_urban_type_id,
    c.func_sys_id,
    c.adt_curnt_amt,
    c.adt_curnt_year,
    c.adt_adj_curnt_amt,
    c.pct_single_trk_adt,
    c.pct_combo_trk_adt,
    c.trk_aadt_pct,
    c.curve_type_id,
    c.curve_lngth,
    c.cd_degr,
    c.delta_left_right_id,
    c.dd_degr,
    c.feature_crossed,
    c.structure_number,
    c.i_r_min_vert_clear,
    c.approach_width,
    c.bridge_median_id,
    c.bridge_loading_type_id,
    c.bridge_loading_in_1000_lbs,
    c.bridge_srvc_type_on_id,
    c.bridge_srvc_type_under_id,
    c.culvert_type_id,
    c.roadway_width,
    c.deck_width,
    c.bridge_dir_of_traffic_id,
    c.bridge_rte_struct_func_id,
    c.bridge_ir_struct_func_id,
    c.crossingnumber,
    c.rrco,
    c.poscrossing_id,
    c.wdcode_id,
    c.standstop,
    c.yield,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt,
    c.mpo_id,
    c.investigat_service_id,
    c.investigat_da_id,
    c.investigator_narrative,
    c.geocoded,
    c.geocode_status,
    c.latitude_geocoded,
    c.longitude_geocoded,
    c.latitude_primary,
    c.longitude_primary,
    c.geocode_date,
    c.geocode_provider,
    c.qa_status,
    c.last_update,
    c.approval_date,
    c.approved_by,
    c.is_retired,
    c.updated_by,
    c.address_confirmed_primary,
    c.address_confirmed_secondary,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.apd_confirmed_fatality,
    c.apd_confirmed_death_count,
    c.micromobility_device_flag,
    c.cr3_stored_flag,
    c.apd_human_update,
    c.speed_mgmt_points,
    c.geocode_match_quality,
    c.geocode_match_metadata,
    c.atd_mode_category_metadata,
    c.location_id,
    c.changes_approved_date,
    c.austin_full_purpose,
    c.original_city_id,
    c.atd_fatality_count,
    c.temp_record,
    c.cr3_file_metadata,
    c.cr3_ocr_extraction_date,
    c.surface_polygon_hex_id
   FROM public.five_year_atd_txdot_crashes c,
    cr3_mainlanes l
  WHERE (NOT public.st_contains(l.geometry, c."position"))
  WITH NO DATA;


ALTER TABLE public.five_year_cr3_crashes_off_mainlane OWNER TO atd_vz_data;

--
-- Name: five_year_non_cr3_crashes_off_mainlane; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_non_cr3_crashes_off_mainlane AS
 WITH non_cr3_mainlanes AS (
         SELECT public.st_transform(public.st_buffer(public.st_transform(public.st_union(non_cr3_mainlanes.geometry), 2277), (1)::double precision), 4326) AS geometry
           FROM public.non_cr3_mainlanes
        )
 SELECT c.form_id,
    c.date,
    c.case_id,
    c.address,
    c.longitude,
    c.latitude,
    c.hour,
    c.location_id,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.surface_polygon_hex_id
   FROM public.five_year_atd_apd_blueform c,
    non_cr3_mainlanes l
  WHERE (NOT public.st_contains(l.geometry, c."position"))
  WITH NO DATA;


ALTER TABLE public.five_year_non_cr3_crashes_off_mainlane OWNER TO atd_vz_data;

--
-- Name: five_year_all_crashes_off_mainlane; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_all_crashes_off_mainlane AS
 SELECT 1 AS non_cr3,
    0 AS cr3,
    five_year_non_cr3_crashes_off_mainlane.case_id AS crash_id,
    five_year_non_cr3_crashes_off_mainlane.date,
    five_year_non_cr3_crashes_off_mainlane.speed_mgmt_points,
    five_year_non_cr3_crashes_off_mainlane.est_comp_cost,
    five_year_non_cr3_crashes_off_mainlane.est_econ_cost,
    five_year_non_cr3_crashes_off_mainlane."position" AS geometry,
    0 AS sus_serious_injry_cnt,
    0 AS nonincap_injry_cnt,
    0 AS poss_injry_cnt,
    0 AS non_injry_cnt,
    0 AS unkn_injry_cnt,
    0 AS tot_injry_cnt,
    0 AS death_cnt
   FROM public.five_year_non_cr3_crashes_off_mainlane
UNION
 SELECT 0 AS non_cr3,
    1 AS cr3,
    five_year_cr3_crashes_off_mainlane.crash_id,
    five_year_cr3_crashes_off_mainlane.crash_date AS date,
    five_year_cr3_crashes_off_mainlane.speed_mgmt_points,
    five_year_cr3_crashes_off_mainlane.est_comp_cost,
    five_year_cr3_crashes_off_mainlane.est_econ_cost,
    five_year_cr3_crashes_off_mainlane."position" AS geometry,
    five_year_cr3_crashes_off_mainlane.sus_serious_injry_cnt,
    five_year_cr3_crashes_off_mainlane.nonincap_injry_cnt,
    five_year_cr3_crashes_off_mainlane.poss_injry_cnt,
    five_year_cr3_crashes_off_mainlane.non_injry_cnt,
    five_year_cr3_crashes_off_mainlane.unkn_injry_cnt,
    five_year_cr3_crashes_off_mainlane.tot_injry_cnt,
    five_year_cr3_crashes_off_mainlane.death_cnt
   FROM public.five_year_cr3_crashes_off_mainlane
  WITH NO DATA;


ALTER TABLE public.five_year_all_crashes_off_mainlane OWNER TO atd_vz_data;

--
-- Name: five_year_all_crashes_off_mainlane_outside_surface_polygons; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_all_crashes_off_mainlane_outside_surface_polygons AS
 SELECT c.non_cr3,
    c.cr3,
    c.crash_id,
    c.date,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c.geometry,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt
   FROM (public.five_year_all_crashes_off_mainlane c
     LEFT JOIN public.atd_txdot_locations p ON (((p.location_group = 1) AND (p.geometry OPERATOR(public.&&) c.geometry) AND public.st_contains(p.geometry, c.geometry))))
  WHERE (p.polygon_hex_id IS NULL)
  WITH NO DATA;


ALTER TABLE public.five_year_all_crashes_off_mainlane_outside_surface_polygons OWNER TO atd_vz_data;

--
-- Name: five_year_cr3_crashes_outside_surface_polygons; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_cr3_crashes_outside_surface_polygons AS
 SELECT c.crash_id,
    c.crash_fatal_fl,
    c.cmv_involv_fl,
    c.schl_bus_fl,
    c.rr_relat_fl,
    c.medical_advisory_fl,
    c.amend_supp_fl,
    c.active_school_zone_fl,
    c.crash_date,
    c.crash_time,
    c.case_id,
    c.local_use,
    c.rpt_cris_cnty_id,
    c.rpt_city_id,
    c.rpt_outside_city_limit_fl,
    c.thousand_damage_fl,
    c.rpt_latitude,
    c.rpt_longitude,
    c.rpt_rdwy_sys_id,
    c.rpt_hwy_num,
    c.rpt_hwy_sfx,
    c.rpt_road_part_id,
    c.rpt_block_num,
    c.rpt_street_pfx,
    c.rpt_street_name,
    c.rpt_street_sfx,
    c.private_dr_fl,
    c.toll_road_fl,
    c.crash_speed_limit,
    c.road_constr_zone_fl,
    c.road_constr_zone_wrkr_fl,
    c.rpt_street_desc,
    c.at_intrsct_fl,
    c.rpt_sec_rdwy_sys_id,
    c.rpt_sec_hwy_num,
    c.rpt_sec_hwy_sfx,
    c.rpt_sec_road_part_id,
    c.rpt_sec_block_num,
    c.rpt_sec_street_pfx,
    c.rpt_sec_street_name,
    c.rpt_sec_street_sfx,
    c.rpt_ref_mark_offset_amt,
    c.rpt_ref_mark_dist_uom,
    c.rpt_ref_mark_dir,
    c.rpt_ref_mark_nbr,
    c.rpt_sec_street_desc,
    c.rpt_crossingnumber,
    c.wthr_cond_id,
    c.light_cond_id,
    c.entr_road_id,
    c.road_type_id,
    c.road_algn_id,
    c.surf_cond_id,
    c.traffic_cntl_id,
    c.investigat_notify_time,
    c.investigat_notify_meth,
    c.investigat_arrv_time,
    c.report_date,
    c.investigat_comp_fl,
    c.investigator_name,
    c.id_number,
    c.ori_number,
    c.investigat_agency_id,
    c.investigat_area_id,
    c.investigat_district_id,
    c.investigat_region_id,
    c.bridge_detail_id,
    c.harm_evnt_id,
    c.intrsct_relat_id,
    c.fhe_collsn_id,
    c.obj_struck_id,
    c.othr_factr_id,
    c.road_part_adj_id,
    c.road_cls_id,
    c.road_relat_id,
    c.phys_featr_1_id,
    c.phys_featr_2_id,
    c.cnty_id,
    c.city_id,
    c.latitude,
    c.longitude,
    c.hwy_sys,
    c.hwy_nbr,
    c.hwy_sfx,
    c.dfo,
    c.street_name,
    c.street_nbr,
    c.control,
    c.section,
    c.milepoint,
    c.ref_mark_nbr,
    c.ref_mark_displ,
    c.hwy_sys_2,
    c.hwy_nbr_2,
    c.hwy_sfx_2,
    c.street_name_2,
    c.street_nbr_2,
    c.control_2,
    c.section_2,
    c.milepoint_2,
    c.txdot_rptable_fl,
    c.onsys_fl,
    c.rural_fl,
    c.crash_sev_id,
    c.pop_group_id,
    c.located_fl,
    c.day_of_week,
    c.hwy_dsgn_lane_id,
    c.hwy_dsgn_hrt_id,
    c.hp_shldr_left,
    c.hp_shldr_right,
    c.hp_median_width,
    c.base_type_id,
    c.nbr_of_lane,
    c.row_width_usual,
    c.roadbed_width,
    c.surf_width,
    c.surf_type_id,
    c.curb_type_left_id,
    c.curb_type_right_id,
    c.shldr_type_left_id,
    c.shldr_width_left,
    c.shldr_use_left_id,
    c.shldr_type_right_id,
    c.shldr_width_right,
    c.shldr_use_right_id,
    c.median_type_id,
    c.median_width,
    c.rural_urban_type_id,
    c.func_sys_id,
    c.adt_curnt_amt,
    c.adt_curnt_year,
    c.adt_adj_curnt_amt,
    c.pct_single_trk_adt,
    c.pct_combo_trk_adt,
    c.trk_aadt_pct,
    c.curve_type_id,
    c.curve_lngth,
    c.cd_degr,
    c.delta_left_right_id,
    c.dd_degr,
    c.feature_crossed,
    c.structure_number,
    c.i_r_min_vert_clear,
    c.approach_width,
    c.bridge_median_id,
    c.bridge_loading_type_id,
    c.bridge_loading_in_1000_lbs,
    c.bridge_srvc_type_on_id,
    c.bridge_srvc_type_under_id,
    c.culvert_type_id,
    c.roadway_width,
    c.deck_width,
    c.bridge_dir_of_traffic_id,
    c.bridge_rte_struct_func_id,
    c.bridge_ir_struct_func_id,
    c.crossingnumber,
    c.rrco,
    c.poscrossing_id,
    c.wdcode_id,
    c.standstop,
    c.yield,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt,
    c.mpo_id,
    c.investigat_service_id,
    c.investigat_da_id,
    c.investigator_narrative,
    c.geocoded,
    c.geocode_status,
    c.latitude_geocoded,
    c.longitude_geocoded,
    c.latitude_primary,
    c.longitude_primary,
    c.geocode_date,
    c.geocode_provider,
    c.qa_status,
    c.last_update,
    c.approval_date,
    c.approved_by,
    c.is_retired,
    c.updated_by,
    c.address_confirmed_primary,
    c.address_confirmed_secondary,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.apd_confirmed_fatality,
    c.apd_confirmed_death_count,
    c.micromobility_device_flag,
    c.cr3_stored_flag,
    c.apd_human_update,
    c.speed_mgmt_points,
    c.geocode_match_quality,
    c.geocode_match_metadata,
    c.atd_mode_category_metadata,
    c.location_id,
    c.changes_approved_date,
    c.austin_full_purpose,
    c.original_city_id,
    c.atd_fatality_count,
    c.temp_record,
    c.cr3_file_metadata,
    c.cr3_ocr_extraction_date,
    c.surface_polygon_hex_id
   FROM public.five_year_atd_txdot_crashes c
  WHERE (c.surface_polygon_hex_id IS NULL)
  WITH NO DATA;


ALTER TABLE public.five_year_cr3_crashes_outside_surface_polygons OWNER TO atd_vz_data;

--
-- Name: five_year_non_cr3_crashes_outside_surface_polygons; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_non_cr3_crashes_outside_surface_polygons AS
 SELECT c.form_id,
    c.date,
    c.case_id,
    c.address,
    c.longitude,
    c.latitude,
    c.hour,
    c.location_id,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    c.surface_polygon_hex_id
   FROM public.five_year_atd_apd_blueform c
  WHERE (c.surface_polygon_hex_id IS NULL)
  WITH NO DATA;


ALTER TABLE public.five_year_non_cr3_crashes_outside_surface_polygons OWNER TO atd_vz_data;

--
-- Name: five_year_all_crashes_outside_surface_polygons; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_all_crashes_outside_surface_polygons AS
 SELECT 1 AS non_cr3,
    0 AS cr3,
    five_year_non_cr3_crashes_outside_surface_polygons.case_id AS crash_id,
    five_year_non_cr3_crashes_outside_surface_polygons.date,
    five_year_non_cr3_crashes_outside_surface_polygons.speed_mgmt_points,
    five_year_non_cr3_crashes_outside_surface_polygons.est_comp_cost,
    five_year_non_cr3_crashes_outside_surface_polygons.est_econ_cost,
    five_year_non_cr3_crashes_outside_surface_polygons."position" AS geometry,
    0 AS sus_serious_injry_cnt,
    0 AS nonincap_injry_cnt,
    0 AS poss_injry_cnt,
    0 AS non_injry_cnt,
    0 AS unkn_injry_cnt,
    0 AS tot_injry_cnt,
    0 AS death_cnt
   FROM public.five_year_non_cr3_crashes_outside_surface_polygons
UNION
 SELECT 0 AS non_cr3,
    1 AS cr3,
    five_year_cr3_crashes_outside_surface_polygons.crash_id,
    five_year_cr3_crashes_outside_surface_polygons.crash_date AS date,
    five_year_cr3_crashes_outside_surface_polygons.speed_mgmt_points,
    five_year_cr3_crashes_outside_surface_polygons.est_comp_cost,
    five_year_cr3_crashes_outside_surface_polygons.est_econ_cost,
    five_year_cr3_crashes_outside_surface_polygons."position" AS geometry,
    five_year_cr3_crashes_outside_surface_polygons.sus_serious_injry_cnt,
    five_year_cr3_crashes_outside_surface_polygons.nonincap_injry_cnt,
    five_year_cr3_crashes_outside_surface_polygons.poss_injry_cnt,
    five_year_cr3_crashes_outside_surface_polygons.non_injry_cnt,
    five_year_cr3_crashes_outside_surface_polygons.unkn_injry_cnt,
    five_year_cr3_crashes_outside_surface_polygons.tot_injry_cnt,
    five_year_cr3_crashes_outside_surface_polygons.death_cnt
   FROM public.five_year_cr3_crashes_outside_surface_polygons
  WITH NO DATA;


ALTER TABLE public.five_year_all_crashes_outside_surface_polygons OWNER TO atd_vz_data;

--
-- Name: five_year_all_crashes_outside_any_polygons; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_all_crashes_outside_any_polygons AS
 SELECT c.non_cr3,
    c.cr3,
    c.crash_id,
    c.date,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c.geometry,
    c.sus_serious_injry_cnt,
    c.nonincap_injry_cnt,
    c.poss_injry_cnt,
    c.non_injry_cnt,
    c.unkn_injry_cnt,
    c.tot_injry_cnt,
    c.death_cnt
   FROM (public.five_year_all_crashes_outside_surface_polygons c
     LEFT JOIN public.atd_txdot_locations p ON (((p.location_group = 2) AND (p.geometry OPERATOR(public.&&) c.geometry) AND public.st_contains(p.geometry, c.geometry))))
  WHERE (p.polygon_hex_id IS NULL)
  WITH NO DATA;


ALTER TABLE public.five_year_all_crashes_outside_any_polygons OWNER TO atd_vz_data;

--
-- Name: hin_corridors; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.hin_corridors (
    id integer NOT NULL,
    name character varying(128),
    corridor public.geometry(MultiLineString,4326),
    buffered_corridor public.geometry(MultiPolygon,4326)
);


ALTER TABLE public.hin_corridors OWNER TO atd_vz_data;

--
-- Name: hin_corridors_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.hin_corridors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.hin_corridors_id_seq OWNER TO atd_vz_data;

--
-- Name: hin_corridors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.hin_corridors_id_seq OWNED BY public.hin_corridors.id;


--
-- Name: intersection_road_map_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.intersection_road_map_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.intersection_road_map_id_seq OWNER TO atd_vz_data;

--
-- Name: intersection_road_map; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.intersection_road_map (
    id integer DEFAULT nextval('public.intersection_road_map_id_seq'::regclass) NOT NULL,
    intersection integer NOT NULL,
    road integer NOT NULL
);


ALTER TABLE public.intersection_road_map OWNER TO atd_vz_data;

--
-- Name: intersections_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.intersections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.intersections_id_seq OWNER TO atd_vz_data;

--
-- Name: intersections; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.intersections (
    id integer DEFAULT nextval('public.intersections_id_seq'::regclass) NOT NULL,
    geometry public.geometry(Point,4326)
);


ALTER TABLE public.intersections OWNER TO atd_vz_data;

--
-- Name: polygons_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.polygons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.polygons_id_seq OWNER TO atd_vz_data;

--
-- Name: polygons; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.polygons (
    id integer DEFAULT nextval('public.polygons_id_seq'::regclass) NOT NULL,
    road integer,
    intersection integer,
    geometry public.geometry(MultiPolygon,4326),
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
    polygon_hex_id character varying(16)
);


ALTER TABLE public.polygons OWNER TO atd_vz_data;

--
-- Name: view_atd_crashes_full_purpose; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_atd_crashes_full_purpose AS
 SELECT atc.crash_id,
    atc.crash_fatal_fl,
    atc.cmv_involv_fl,
    atc.schl_bus_fl,
    atc.rr_relat_fl,
    atc.medical_advisory_fl,
    atc.amend_supp_fl,
    atc.active_school_zone_fl,
    atc.crash_date,
    atc.crash_time,
    atc.case_id,
    atc.local_use,
    atc.rpt_cris_cnty_id,
    atc.rpt_city_id,
    atc.rpt_outside_city_limit_fl,
    atc.thousand_damage_fl,
    atc.rpt_latitude,
    atc.rpt_longitude,
    atc.rpt_rdwy_sys_id,
    atc.rpt_hwy_num,
    atc.rpt_hwy_sfx,
    atc.rpt_road_part_id,
    atc.rpt_block_num,
    atc.rpt_street_pfx,
    atc.rpt_street_name,
    atc.rpt_street_sfx,
    atc.private_dr_fl,
    atc.toll_road_fl,
    atc.crash_speed_limit,
    atc.road_constr_zone_fl,
    atc.road_constr_zone_wrkr_fl,
    atc.rpt_street_desc,
    atc.at_intrsct_fl,
    atc.rpt_sec_rdwy_sys_id,
    atc.rpt_sec_hwy_num,
    atc.rpt_sec_hwy_sfx,
    atc.rpt_sec_road_part_id,
    atc.rpt_sec_block_num,
    atc.rpt_sec_street_pfx,
    atc.rpt_sec_street_name,
    atc.rpt_sec_street_sfx,
    atc.rpt_ref_mark_offset_amt,
    atc.rpt_ref_mark_dist_uom,
    atc.rpt_ref_mark_dir,
    atc.rpt_ref_mark_nbr,
    atc.rpt_sec_street_desc,
    atc.rpt_crossingnumber,
    atc.wthr_cond_id,
    atc.light_cond_id,
    atc.entr_road_id,
    atc.road_type_id,
    atc.road_algn_id,
    atc.surf_cond_id,
    atc.traffic_cntl_id,
    atc.investigat_notify_time,
    atc.investigat_notify_meth,
    atc.investigat_arrv_time,
    atc.report_date,
    atc.investigat_comp_fl,
    atc.investigator_name,
    atc.id_number,
    atc.ori_number,
    atc.investigat_agency_id,
    atc.investigat_area_id,
    atc.investigat_district_id,
    atc.investigat_region_id,
    atc.bridge_detail_id,
    atc.harm_evnt_id,
    atc.intrsct_relat_id,
    atc.fhe_collsn_id,
    atc.obj_struck_id,
    atc.othr_factr_id,
    atc.road_part_adj_id,
    atc.road_cls_id,
    atc.road_relat_id,
    atc.phys_featr_1_id,
    atc.phys_featr_2_id,
    atc.cnty_id,
    atc.city_id,
    atc.latitude,
    atc.longitude,
    atc.hwy_sys,
    atc.hwy_nbr,
    atc.hwy_sfx,
    atc.dfo,
    atc.street_name,
    atc.street_nbr,
    atc.control,
    atc.section,
    atc.milepoint,
    atc.ref_mark_nbr,
    atc.ref_mark_displ,
    atc.hwy_sys_2,
    atc.hwy_nbr_2,
    atc.hwy_sfx_2,
    atc.street_name_2,
    atc.street_nbr_2,
    atc.control_2,
    atc.section_2,
    atc.milepoint_2,
    atc.txdot_rptable_fl,
    atc.onsys_fl,
    atc.rural_fl,
    atc.crash_sev_id,
    atc.pop_group_id,
    atc.located_fl,
    atc.day_of_week,
    atc.hwy_dsgn_lane_id,
    atc.hwy_dsgn_hrt_id,
    atc.hp_shldr_left,
    atc.hp_shldr_right,
    atc.hp_median_width,
    atc.base_type_id,
    atc.nbr_of_lane,
    atc.row_width_usual,
    atc.roadbed_width,
    atc.surf_width,
    atc.surf_type_id,
    atc.curb_type_left_id,
    atc.curb_type_right_id,
    atc.shldr_type_left_id,
    atc.shldr_width_left,
    atc.shldr_use_left_id,
    atc.shldr_type_right_id,
    atc.shldr_width_right,
    atc.shldr_use_right_id,
    atc.median_type_id,
    atc.median_width,
    atc.rural_urban_type_id,
    atc.func_sys_id,
    atc.adt_curnt_amt,
    atc.adt_curnt_year,
    atc.adt_adj_curnt_amt,
    atc.pct_single_trk_adt,
    atc.pct_combo_trk_adt,
    atc.trk_aadt_pct,
    atc.curve_type_id,
    atc.curve_lngth,
    atc.cd_degr,
    atc.delta_left_right_id,
    atc.dd_degr,
    atc.feature_crossed,
    atc.structure_number,
    atc.i_r_min_vert_clear,
    atc.approach_width,
    atc.bridge_median_id,
    atc.bridge_loading_type_id,
    atc.bridge_loading_in_1000_lbs,
    atc.bridge_srvc_type_on_id,
    atc.bridge_srvc_type_under_id,
    atc.culvert_type_id,
    atc.roadway_width,
    atc.deck_width,
    atc.bridge_dir_of_traffic_id,
    atc.bridge_rte_struct_func_id,
    atc.bridge_ir_struct_func_id,
    atc.crossingnumber,
    atc.rrco,
    atc.poscrossing_id,
    atc.wdcode_id,
    atc.standstop,
    atc.yield,
    atc.sus_serious_injry_cnt,
    atc.nonincap_injry_cnt,
    atc.poss_injry_cnt,
    atc.non_injry_cnt,
    atc.unkn_injry_cnt,
    atc.tot_injry_cnt,
    atc.death_cnt,
    atc.mpo_id,
    atc.investigat_service_id,
    atc.investigat_da_id,
    atc.investigator_narrative,
    atc.geocoded,
    atc.geocode_status,
    atc.latitude_geocoded,
    atc.longitude_geocoded,
    atc.latitude_primary,
    atc.longitude_primary,
    atc.geocode_date,
    atc.geocode_provider,
    atc.qa_status,
    atc.last_update,
    atc.approval_date,
    atc.approved_by,
    atc.is_retired,
    atc.updated_by,
    atc.address_confirmed_primary,
    atc.address_confirmed_secondary,
    atc.est_comp_cost,
    atc.est_econ_cost,
    atc."position",
    atc.apd_confirmed_fatality,
    atc.apd_confirmed_death_count,
    atc.micromobility_device_flag,
    atc.cr3_stored_flag,
    atc.apd_human_update,
    atc.speed_mgmt_points,
    atc.geocode_match_quality,
    atc.geocode_match_metadata,
    atc.atd_mode_category_metadata,
    atc.location_id,
    atc.changes_approved_date,
    atc.austin_full_purpose
   FROM (public.atd_txdot_crashes atc
     JOIN public.atd_jurisdictions aj ON (((1 = 1) AND (aj.id = 5) AND (aj.geometry OPERATOR(public.&&) atc."position") AND public.st_contains(aj.geometry, atc."position"))))
  WHERE ((1 = 1) AND (atc."position" IS NOT NULL) AND (atc.crash_date >= (concat(date_part('year'::text, now()), '-01-01'))::date))
UNION ALL
 SELECT atc.crash_id,
    atc.crash_fatal_fl,
    atc.cmv_involv_fl,
    atc.schl_bus_fl,
    atc.rr_relat_fl,
    atc.medical_advisory_fl,
    atc.amend_supp_fl,
    atc.active_school_zone_fl,
    atc.crash_date,
    atc.crash_time,
    atc.case_id,
    atc.local_use,
    atc.rpt_cris_cnty_id,
    atc.rpt_city_id,
    atc.rpt_outside_city_limit_fl,
    atc.thousand_damage_fl,
    atc.rpt_latitude,
    atc.rpt_longitude,
    atc.rpt_rdwy_sys_id,
    atc.rpt_hwy_num,
    atc.rpt_hwy_sfx,
    atc.rpt_road_part_id,
    atc.rpt_block_num,
    atc.rpt_street_pfx,
    atc.rpt_street_name,
    atc.rpt_street_sfx,
    atc.private_dr_fl,
    atc.toll_road_fl,
    atc.crash_speed_limit,
    atc.road_constr_zone_fl,
    atc.road_constr_zone_wrkr_fl,
    atc.rpt_street_desc,
    atc.at_intrsct_fl,
    atc.rpt_sec_rdwy_sys_id,
    atc.rpt_sec_hwy_num,
    atc.rpt_sec_hwy_sfx,
    atc.rpt_sec_road_part_id,
    atc.rpt_sec_block_num,
    atc.rpt_sec_street_pfx,
    atc.rpt_sec_street_name,
    atc.rpt_sec_street_sfx,
    atc.rpt_ref_mark_offset_amt,
    atc.rpt_ref_mark_dist_uom,
    atc.rpt_ref_mark_dir,
    atc.rpt_ref_mark_nbr,
    atc.rpt_sec_street_desc,
    atc.rpt_crossingnumber,
    atc.wthr_cond_id,
    atc.light_cond_id,
    atc.entr_road_id,
    atc.road_type_id,
    atc.road_algn_id,
    atc.surf_cond_id,
    atc.traffic_cntl_id,
    atc.investigat_notify_time,
    atc.investigat_notify_meth,
    atc.investigat_arrv_time,
    atc.report_date,
    atc.investigat_comp_fl,
    atc.investigator_name,
    atc.id_number,
    atc.ori_number,
    atc.investigat_agency_id,
    atc.investigat_area_id,
    atc.investigat_district_id,
    atc.investigat_region_id,
    atc.bridge_detail_id,
    atc.harm_evnt_id,
    atc.intrsct_relat_id,
    atc.fhe_collsn_id,
    atc.obj_struck_id,
    atc.othr_factr_id,
    atc.road_part_adj_id,
    atc.road_cls_id,
    atc.road_relat_id,
    atc.phys_featr_1_id,
    atc.phys_featr_2_id,
    atc.cnty_id,
    atc.city_id,
    atc.latitude,
    atc.longitude,
    atc.hwy_sys,
    atc.hwy_nbr,
    atc.hwy_sfx,
    atc.dfo,
    atc.street_name,
    atc.street_nbr,
    atc.control,
    atc.section,
    atc.milepoint,
    atc.ref_mark_nbr,
    atc.ref_mark_displ,
    atc.hwy_sys_2,
    atc.hwy_nbr_2,
    atc.hwy_sfx_2,
    atc.street_name_2,
    atc.street_nbr_2,
    atc.control_2,
    atc.section_2,
    atc.milepoint_2,
    atc.txdot_rptable_fl,
    atc.onsys_fl,
    atc.rural_fl,
    atc.crash_sev_id,
    atc.pop_group_id,
    atc.located_fl,
    atc.day_of_week,
    atc.hwy_dsgn_lane_id,
    atc.hwy_dsgn_hrt_id,
    atc.hp_shldr_left,
    atc.hp_shldr_right,
    atc.hp_median_width,
    atc.base_type_id,
    atc.nbr_of_lane,
    atc.row_width_usual,
    atc.roadbed_width,
    atc.surf_width,
    atc.surf_type_id,
    atc.curb_type_left_id,
    atc.curb_type_right_id,
    atc.shldr_type_left_id,
    atc.shldr_width_left,
    atc.shldr_use_left_id,
    atc.shldr_type_right_id,
    atc.shldr_width_right,
    atc.shldr_use_right_id,
    atc.median_type_id,
    atc.median_width,
    atc.rural_urban_type_id,
    atc.func_sys_id,
    atc.adt_curnt_amt,
    atc.adt_curnt_year,
    atc.adt_adj_curnt_amt,
    atc.pct_single_trk_adt,
    atc.pct_combo_trk_adt,
    atc.trk_aadt_pct,
    atc.curve_type_id,
    atc.curve_lngth,
    atc.cd_degr,
    atc.delta_left_right_id,
    atc.dd_degr,
    atc.feature_crossed,
    atc.structure_number,
    atc.i_r_min_vert_clear,
    atc.approach_width,
    atc.bridge_median_id,
    atc.bridge_loading_type_id,
    atc.bridge_loading_in_1000_lbs,
    atc.bridge_srvc_type_on_id,
    atc.bridge_srvc_type_under_id,
    atc.culvert_type_id,
    atc.roadway_width,
    atc.deck_width,
    atc.bridge_dir_of_traffic_id,
    atc.bridge_rte_struct_func_id,
    atc.bridge_ir_struct_func_id,
    atc.crossingnumber,
    atc.rrco,
    atc.poscrossing_id,
    atc.wdcode_id,
    atc.standstop,
    atc.yield,
    atc.sus_serious_injry_cnt,
    atc.nonincap_injry_cnt,
    atc.poss_injry_cnt,
    atc.non_injry_cnt,
    atc.unkn_injry_cnt,
    atc.tot_injry_cnt,
    atc.death_cnt,
    atc.mpo_id,
    atc.investigat_service_id,
    atc.investigat_da_id,
    atc.investigator_narrative,
    atc.geocoded,
    atc.geocode_status,
    atc.latitude_geocoded,
    atc.longitude_geocoded,
    atc.latitude_primary,
    atc.longitude_primary,
    atc.geocode_date,
    atc.geocode_provider,
    atc.qa_status,
    atc.last_update,
    atc.approval_date,
    atc.approved_by,
    atc.is_retired,
    atc.updated_by,
    atc.address_confirmed_primary,
    atc.address_confirmed_secondary,
    atc.est_comp_cost,
    atc.est_econ_cost,
    atc."position",
    atc.apd_confirmed_fatality,
    atc.apd_confirmed_death_count,
    atc.micromobility_device_flag,
    atc.cr3_stored_flag,
    atc.apd_human_update,
    atc.speed_mgmt_points,
    atc.geocode_match_quality,
    atc.geocode_match_metadata,
    atc.atd_mode_category_metadata,
    atc.location_id,
    atc.changes_approved_date,
    atc.austin_full_purpose
   FROM public.atd_txdot_crashes atc
  WHERE ((1 = 1) AND (atc.city_id = 22) AND (atc."position" IS NULL) AND (atc.crash_date >= (concat(date_part('year'::text, now()), '-01-01'))::date));


ALTER TABLE public.view_atd_crashes_full_purpose OWNER TO atd_vz_data;

--
-- Name: view_crashes_inconsistent_numbers; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_crashes_inconsistent_numbers AS
 WITH persons AS (
         SELECT atd_txdot_person.crash_id,
            sum(atd_txdot_person.death_cnt) AS death_cnt,
            sum(atd_txdot_person.sus_serious_injry_cnt) AS sus_serious_injry_cnt
           FROM public.atd_txdot_person
          GROUP BY atd_txdot_person.crash_id
        ), primarypersons AS (
         SELECT atd_txdot_primaryperson.crash_id,
            sum(atd_txdot_primaryperson.death_cnt) AS death_cnt,
            sum(atd_txdot_primaryperson.sus_serious_injry_cnt) AS sus_serious_injry_cnt
           FROM public.atd_txdot_primaryperson
          GROUP BY atd_txdot_primaryperson.crash_id
        ), units AS (
         SELECT atd_txdot_units.crash_id,
            sum(atd_txdot_units.death_cnt) AS death_cnt,
            sum(atd_txdot_units.sus_serious_injry_cnt) AS sus_serious_injry_cnt
           FROM public.atd_txdot_units
          GROUP BY atd_txdot_units.crash_id
        )
 SELECT atc.crash_id AS atc_crash_id,
    atc.death_cnt AS atc_death_cnt,
    atu.death_cnt AS atu_death_cnt,
    atpp.death_cnt AS atpp_death_cnt,
    COALESCE(atp.death_cnt, (0)::bigint) AS atp_death_cnt,
    atc.sus_serious_injry_cnt,
    atu.sus_serious_injry_cnt AS atu_sus_serious_injry_cnt,
    atpp.sus_serious_injry_cnt AS atpp_sus_serious_injry_cnt,
    COALESCE(atp.sus_serious_injry_cnt, (0)::bigint) AS atp_sus_serious_injry_cnt
   FROM (((public.atd_txdot_crashes atc
     LEFT JOIN persons atp ON ((atc.crash_id = atp.crash_id)))
     LEFT JOIN primarypersons atpp ON ((atc.crash_id = atpp.crash_id)))
     LEFT JOIN units atu ON ((atc.crash_id = atu.crash_id)))
  WHERE ((1 = 1) AND (atc.city_id = 22) AND ((atc.death_cnt <> (atp.death_cnt + atpp.death_cnt)) OR (atc.death_cnt <> atu.death_cnt) OR (atc.sus_serious_injry_cnt <> (atp.sus_serious_injry_cnt + atpp.sus_serious_injry_cnt)) OR (atc.sus_serious_injry_cnt <> atu.sus_serious_injry_cnt)));


ALTER TABLE public.view_crashes_inconsistent_numbers OWNER TO atd_vz_data;

--
-- Name: view_location_crashes_by_manner_collision; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_location_crashes_by_manner_collision AS
 SELECT atcloc.location_id,
    atcol.collsn_desc,
    count(1) AS count
   FROM ((public.atd_txdot_crashes atc
     LEFT JOIN public.atd_txdot__collsn_lkp atcol ON ((atcol.collsn_id = atc.fhe_collsn_id)))
     LEFT JOIN public.atd_txdot_crash_locations atcloc ON ((atcloc.crash_id = atc.crash_id)))
  WHERE ((1 = 1) AND (atcloc.location_id IS NOT NULL) AND ((atcloc.location_id)::text <> 'None'::text))
  GROUP BY atcloc.location_id, atcol.collsn_desc;


ALTER TABLE public.view_location_crashes_by_manner_collision OWNER TO atd_vz_data;

--
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

--
-- Name: view_location_crashes_global; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_location_crashes_global AS
SELECT
    NULL::integer AS crash_id,
    NULL::text AS type,
    NULL::character varying AS location_id,
    NULL::character varying AS case_id,
    NULL::date AS crash_date,
    NULL::time without time zone AS crash_time,
    NULL::character varying AS day_of_week,
    NULL::integer AS crash_sev_id,
    NULL::double precision AS longitude_primary,
    NULL::double precision AS latitude_primary,
    NULL::text AS address_confirmed_primary,
    NULL::text AS address_confirmed_secondary,
    NULL::integer AS non_injry_cnt,
    NULL::integer AS nonincap_injry_cnt,
    NULL::integer AS poss_injry_cnt,
    NULL::integer AS sus_serious_injry_cnt,
    NULL::integer AS tot_injry_cnt,
    NULL::integer AS death_cnt,
    NULL::integer AS unkn_injry_cnt,
    NULL::numeric(10,2) AS est_comp_cost,
    NULL::text AS collsn_desc,
    NULL::text AS travel_direction,
    NULL::text AS movement_desc,
    NULL::text AS veh_body_styl_desc,
    NULL::text AS veh_unit_desc_desc;


ALTER TABLE public.view_location_crashes_global OWNER TO atd_vz_data;

--
-- Name: view_location_injry_count_cost_summary; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_location_injry_count_cost_summary AS
 SELECT (atcloc.location_id)::character varying(32) AS location_id,
    (COALESCE(ccs.total_crashes, (0)::bigint) + COALESCE(blueform_ccs.total_crashes, (0)::bigint)) AS total_crashes,
    COALESCE(ccs.total_deaths, (0)::bigint) AS total_deaths,
    COALESCE(ccs.total_serious_injuries, (0)::bigint) AS total_serious_injuries,
    (COALESCE(ccs.est_comp_cost, (0)::numeric) + COALESCE(blueform_ccs.est_comp_cost, (0)::numeric)) AS est_comp_cost
   FROM ((public.atd_txdot_locations atcloc
     LEFT JOIN ( SELECT atc.location_id,
            count(1) AS total_crashes,
            sum(atc.death_cnt) AS total_deaths,
            sum(atc.sus_serious_injry_cnt) AS total_serious_injuries,
            sum(atc.est_comp_cost_crash_based) AS est_comp_cost
           FROM public.atd_txdot_crashes atc
          WHERE ((1 = 1) AND (atc.crash_date > (now() - '5 years'::interval)) AND (atc.location_id IS NOT NULL) AND ((atc.location_id)::text <> 'None'::text))
          GROUP BY atc.location_id) ccs ON (((ccs.location_id)::text = (atcloc.location_id)::text)))
     LEFT JOIN ( SELECT aab.location_id,
            sum(aab.est_comp_cost_crash_based) AS est_comp_cost,
            count(1) AS total_crashes
           FROM public.atd_apd_blueform aab
          WHERE ((1 = 1) AND (aab.date > (now() - '5 years'::interval)) AND (aab.location_id IS NOT NULL) AND ((aab.location_id)::text <> 'None'::text))
          GROUP BY aab.location_id) blueform_ccs ON (((blueform_ccs.location_id)::text = (atcloc.location_id)::text)));


ALTER TABLE public.view_location_injry_count_cost_summary OWNER TO atd_vz_data;

--
-- Name: view_vzv_by_mode; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_vzv_by_mode AS
 SELECT date_part('year'::text, atc.crash_date) AS year,
        CASE
            WHEN (vdesc.veh_unit_desc_id = 1) THEN
            CASE
                WHEN (vbody.veh_body_styl_id = 71) THEN 'Motorcyclist'::text
                ELSE 'Motorist'::text
            END
            WHEN (vdesc.veh_unit_desc_id = 3) THEN 'Bicyclist'::text
            WHEN (vdesc.veh_unit_desc_id = 4) THEN 'Pedestrian'::text
            ELSE 'Other'::text
        END AS unit_desc,
    sum(atu.death_cnt) AS death_cnt,
    sum(atu.sus_serious_injry_cnt) AS sus_serious_injry_cnt
   FROM (((public.atd_txdot_crashes atc
     LEFT JOIN public.atd_txdot_units atu ON ((atc.crash_id = atu.crash_id)))
     LEFT JOIN public.atd_txdot__veh_unit_desc_lkp vdesc ON ((vdesc.veh_unit_desc_id = atu.unit_desc_id)))
     LEFT JOIN public.atd_txdot__veh_body_styl_lkp vbody ON ((vbody.veh_body_styl_id = atu.veh_body_styl_id)))
  WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND ((atc.death_cnt > 0) OR (atc.sus_serious_injry_cnt > 0)) AND (atc.crash_date >= (concat((date_part('year'::text, (now() - '4 years'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))
  GROUP BY (date_part('year'::text, atc.crash_date)),
        CASE
            WHEN (vdesc.veh_unit_desc_id = 1) THEN
            CASE
                WHEN (vbody.veh_body_styl_id = 71) THEN 'Motorcyclist'::text
                ELSE 'Motorist'::text
            END
            WHEN (vdesc.veh_unit_desc_id = 3) THEN 'Bicyclist'::text
            WHEN (vdesc.veh_unit_desc_id = 4) THEN 'Pedestrian'::text
            ELSE 'Other'::text
        END
  ORDER BY (date_part('year'::text, atc.crash_date)),
        CASE
            WHEN (vdesc.veh_unit_desc_id = 1) THEN
            CASE
                WHEN (vbody.veh_body_styl_id = 71) THEN 'Motorcyclist'::text
                ELSE 'Motorist'::text
            END
            WHEN (vdesc.veh_unit_desc_id = 3) THEN 'Bicyclist'::text
            WHEN (vdesc.veh_unit_desc_id = 4) THEN 'Pedestrian'::text
            ELSE 'Other'::text
        END;


ALTER TABLE public.view_vzv_by_mode OWNER TO atd_vz_data;

--
-- Name: view_vzv_by_month_year; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_vzv_by_month_year AS
 SELECT date_part('year'::text, atc.crash_date) AS year,
    date_part('month'::text, atc.crash_date) AS month,
    sum(atc.death_cnt) AS death_cnt,
    sum(atc.sus_serious_injry_cnt) AS sus_serious_injry_cnt
   FROM public.atd_txdot_crashes atc
  WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND ((atc.death_cnt > 0) OR (atc.sus_serious_injry_cnt > 0)) AND (atc.crash_date >= (concat((date_part('year'::text, (now() - '4 years'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))
  GROUP BY (date_part('year'::text, atc.crash_date)), (date_part('month'::text, atc.crash_date));


ALTER TABLE public.view_vzv_by_month_year OWNER TO atd_vz_data;

--
-- Name: view_vzv_by_time_of_day; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_vzv_by_time_of_day AS
 SELECT date_part('year'::text, atc.crash_date) AS year,
    to_char((atc.crash_date)::timestamp with time zone, 'Dy'::text) AS dow,
    date_part('hour'::text, atc.crash_time) AS hour,
    sum(atc.death_cnt) AS death_cnt,
    sum(atc.sus_serious_injry_cnt) AS sus_serious_injry_cnt
   FROM public.atd_txdot_crashes atc
  WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND ((atc.death_cnt > 0) OR (atc.sus_serious_injry_cnt > 0)) AND (atc.crash_date >= (concat((date_part('year'::text, (now() - '4 years'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))
  GROUP BY (date_part('year'::text, atc.crash_date)), (to_char((atc.crash_date)::timestamp with time zone, 'Dy'::text)), (date_part('hour'::text, atc.crash_time))
  ORDER BY (date_part('year'::text, atc.crash_date)), (to_char((atc.crash_date)::timestamp with time zone, 'Dy'::text)), (date_part('hour'::text, atc.crash_time));


ALTER TABLE public.view_vzv_by_time_of_day OWNER TO atd_vz_data;

--
-- Name: view_vzv_demographics_age_sex_eth; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_vzv_demographics_age_sex_eth AS
 SELECT data.year,
    data.type,
    sum(data.under_18) AS under_18,
    sum(data.from_18_to_44) AS from_18_to_44,
    sum(data.from_45_to_64) AS from_45_to_64,
    sum(data.from_65) AS from_65,
    sum(data.unknown) AS unknown,
    sum(data.gender_male) AS gender_male,
    sum(data.gender_female) AS gender_female,
    sum(data.gender_unknown) AS gender_unknown,
    sum(data.ethn_white) AS ethn_white,
    sum(data.ethn_hispanic) AS ethn_hispanic,
    sum(data.ethn_black) AS ethn_black,
    sum(data.ethn_asian) AS ethn_asian,
    sum(data.ethn_other) AS ethn_other,
    sum(data.ethn_amer_ind_nat) AS ethn_amer_ind_nat,
    sum(data.total) AS total
   FROM ( SELECT date_part('year'::text, atc.crash_date) AS year,
            'fatalities'::text AS type,
            sum(
                CASE
                    WHEN (atp.prsn_age < 18) THEN 1
                    ELSE 0
                END) AS under_18,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 17) AND (atp.prsn_age < 45)) THEN 1
                    ELSE 0
                END) AS from_18_to_44,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 44) AND (atp.prsn_age < 65)) THEN 1
                    ELSE 0
                END) AS from_45_to_64,
            sum(
                CASE
                    WHEN (atp.prsn_age > 64) THEN 1
                    ELSE 0
                END) AS from_65,
            sum(
                CASE
                    WHEN (atp.prsn_age IS NULL) THEN 1
                    ELSE 0
                END) AS unknown,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 1) THEN 1
                    ELSE 0
                END) AS gender_male,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 2) THEN 1
                    ELSE 0
                END) AS gender_female,
            sum(
                CASE
                    WHEN ((atp.prsn_gndr_id = 0) OR (atp.prsn_gndr_id IS NULL)) THEN 1
                    ELSE 0
                END) AS gender_unknown,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 1) THEN 1
                    ELSE 0
                END) AS ethn_white,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 2) THEN 1
                    ELSE 0
                END) AS ethn_black,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 3) THEN 1
                    ELSE 0
                END) AS ethn_hispanic,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 4) THEN 1
                    ELSE 0
                END) AS ethn_asian,
            sum(
                CASE
                    WHEN ((atp.prsn_ethnicity_id <> ALL (ARRAY[1, 2, 3, 4, 6])) OR (atp.prsn_ethnicity_id IS NULL)) THEN 1
                    ELSE 0
                END) AS ethn_other,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 6) THEN 1
                    ELSE 0
                END) AS ethn_amer_ind_nat,
            sum(1) AS total
           FROM (public.atd_txdot_crashes atc
             LEFT JOIN public.atd_txdot_person atp ON ((atc.crash_id = atp.crash_id)))
          WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND (atp.death_cnt > 0) AND (atc.crash_date >= (concat((date_part('year'::text, (now() - '4 years'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))
          GROUP BY (date_part('year'::text, atc.crash_date))
        UNION
         SELECT date_part('year'::text, atc.crash_date) AS year,
            'fatalities'::text AS type,
            sum(
                CASE
                    WHEN (atp.prsn_age < 18) THEN 1
                    ELSE 0
                END) AS under_18,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 17) AND (atp.prsn_age < 45)) THEN 1
                    ELSE 0
                END) AS from_18_to_44,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 44) AND (atp.prsn_age < 65)) THEN 1
                    ELSE 0
                END) AS from_45_to_64,
            sum(
                CASE
                    WHEN (atp.prsn_age > 64) THEN 1
                    ELSE 0
                END) AS from_65,
            sum(
                CASE
                    WHEN (atp.prsn_age IS NULL) THEN 1
                    ELSE 0
                END) AS unknown,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 1) THEN 1
                    ELSE 0
                END) AS gender_male,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 2) THEN 1
                    ELSE 0
                END) AS gender_female,
            sum(
                CASE
                    WHEN ((atp.prsn_gndr_id = 0) OR (atp.prsn_gndr_id IS NULL)) THEN 1
                    ELSE 0
                END) AS gender_unknown,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 1) THEN 1
                    ELSE 0
                END) AS ethn_white,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 2) THEN 1
                    ELSE 0
                END) AS ethn_black,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 3) THEN 1
                    ELSE 0
                END) AS ethn_hispanic,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 4) THEN 1
                    ELSE 0
                END) AS ethn_asian,
            sum(
                CASE
                    WHEN ((atp.prsn_ethnicity_id <> ALL (ARRAY[1, 2, 3, 4, 6])) OR (atp.prsn_ethnicity_id IS NULL)) THEN 1
                    ELSE 0
                END) AS ethn_other,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 6) THEN 1
                    ELSE 0
                END) AS ethn_amer_ind_nat,
            sum(1) AS total
           FROM (public.atd_txdot_crashes atc
             LEFT JOIN public.atd_txdot_primaryperson atp ON ((atc.crash_id = atp.crash_id)))
          WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND (atp.death_cnt > 0) AND (atc.crash_date >= (concat((date_part('year'::text, (now() - '4 years'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))
          GROUP BY (date_part('year'::text, atc.crash_date))
        UNION
         SELECT date_part('year'::text, atc.crash_date) AS year,
            'serious_injuries'::text AS type,
            sum(
                CASE
                    WHEN (atp.prsn_age < 18) THEN 1
                    ELSE 0
                END) AS under_18,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 17) AND (atp.prsn_age < 45)) THEN 1
                    ELSE 0
                END) AS from_18_to_44,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 44) AND (atp.prsn_age < 65)) THEN 1
                    ELSE 0
                END) AS from_45_to_64,
            sum(
                CASE
                    WHEN (atp.prsn_age > 64) THEN 1
                    ELSE 0
                END) AS from_65,
            sum(
                CASE
                    WHEN (atp.prsn_age IS NULL) THEN 1
                    ELSE 0
                END) AS unknown,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 1) THEN 1
                    ELSE 0
                END) AS gender_male,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 2) THEN 1
                    ELSE 0
                END) AS gender_female,
            sum(
                CASE
                    WHEN ((atp.prsn_gndr_id = 0) OR (atp.prsn_gndr_id IS NULL)) THEN 1
                    ELSE 0
                END) AS gender_unknown,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 1) THEN 1
                    ELSE 0
                END) AS ethn_white,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 2) THEN 1
                    ELSE 0
                END) AS ethn_black,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 3) THEN 1
                    ELSE 0
                END) AS ethn_hispanic,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 4) THEN 1
                    ELSE 0
                END) AS ethn_asian,
            sum(
                CASE
                    WHEN ((atp.prsn_ethnicity_id <> ALL (ARRAY[1, 2, 3, 4, 6])) OR (atp.prsn_ethnicity_id IS NULL)) THEN 1
                    ELSE 0
                END) AS ethn_other,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 6) THEN 1
                    ELSE 0
                END) AS ethn_amer_ind_nat,
            sum(1) AS total
           FROM (public.atd_txdot_crashes atc
             LEFT JOIN public.atd_txdot_person atp ON ((atc.crash_id = atp.crash_id)))
          WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND (atp.sus_serious_injry_cnt > 0) AND (atc.crash_date >= (concat((date_part('year'::text, (now() - '4 years'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))
          GROUP BY (date_part('year'::text, atc.crash_date))
        UNION
         SELECT date_part('year'::text, atc.crash_date) AS year,
            'serious_injuries'::text AS type,
            sum(
                CASE
                    WHEN (atp.prsn_age < 18) THEN 1
                    ELSE 0
                END) AS under_18,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 17) AND (atp.prsn_age < 45)) THEN 1
                    ELSE 0
                END) AS from_18_to_44,
            sum(
                CASE
                    WHEN ((atp.prsn_age > 44) AND (atp.prsn_age < 65)) THEN 1
                    ELSE 0
                END) AS from_45_to_64,
            sum(
                CASE
                    WHEN (atp.prsn_age > 64) THEN 1
                    ELSE 0
                END) AS from_65,
            sum(
                CASE
                    WHEN (atp.prsn_age IS NULL) THEN 1
                    ELSE 0
                END) AS unknown,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 1) THEN 1
                    ELSE 0
                END) AS gender_male,
            sum(
                CASE
                    WHEN (atp.prsn_gndr_id = 2) THEN 1
                    ELSE 0
                END) AS gender_female,
            sum(
                CASE
                    WHEN ((atp.prsn_gndr_id = 0) OR (atp.prsn_gndr_id IS NULL)) THEN 1
                    ELSE 0
                END) AS gender_unknown,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 1) THEN 1
                    ELSE 0
                END) AS ethn_white,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 2) THEN 1
                    ELSE 0
                END) AS ethn_black,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 3) THEN 1
                    ELSE 0
                END) AS ethn_hispanic,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 4) THEN 1
                    ELSE 0
                END) AS ethn_asian,
            sum(
                CASE
                    WHEN ((atp.prsn_ethnicity_id <> ALL (ARRAY[1, 2, 3, 4, 6])) OR (atp.prsn_ethnicity_id IS NULL)) THEN 1
                    ELSE 0
                END) AS ethn_other,
            sum(
                CASE
                    WHEN (atp.prsn_ethnicity_id = 6) THEN 1
                    ELSE 0
                END) AS ethn_amer_ind_nat,
            sum(1) AS total
           FROM (public.atd_txdot_crashes atc
             LEFT JOIN public.atd_txdot_primaryperson atp ON ((atc.crash_id = atp.crash_id)))
          WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND (atp.sus_serious_injry_cnt > 0) AND (atc.crash_date >= (concat((date_part('year'::text, (now() - '4 years'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))
          GROUP BY (date_part('year'::text, atc.crash_date))) data
  GROUP BY data.year, data.type
  ORDER BY data.year, data.type;


ALTER TABLE public.view_vzv_demographics_age_sex_eth OWNER TO atd_vz_data;

--
-- Name: view_vzv_header_totals; Type: VIEW; Schema: public; Owner: atd_vz_data
--

CREATE VIEW public.view_vzv_header_totals AS
 SELECT people.year,
    people.death_cnt,
    people.years_of_life_lost,
    people.sus_serious_injry_cnt,
    crashes.total_crashes
   FROM (( SELECT people_1.year,
            sum(people_1.death_cnt) AS death_cnt,
            sum(people_1.yll) AS years_of_life_lost,
            sum(people_1.sus_serious_injry_cnt) AS sus_serious_injry_cnt
           FROM ( SELECT date_part('year'::text, atc.crash_date) AS year,
                    sum(
                        CASE
                            WHEN (atpp.death_cnt > 0) THEN
                            CASE
                                WHEN (atpp.prsn_age >= 75) THEN 0
                                ELSE (75 - atpp.prsn_age)
                            END
                            ELSE 0
                        END) AS yll,
                    sum(atpp.death_cnt) AS death_cnt,
                    sum(atpp.sus_serious_injry_cnt) AS sus_serious_injry_cnt
                   FROM (public.atd_txdot_crashes atc
                     LEFT JOIN public.atd_txdot_primaryperson atpp ON ((atpp.crash_id = atc.crash_id)))
                  WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND ((atpp.death_cnt > 0) OR (atpp.sus_serious_injry_cnt > 0)) AND (((atc.crash_date >= (concat((date_part('year'::text, (now() - '1 year'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, (now() - '1 year'::interval)))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date)) OR ((atc.crash_date >= (concat((date_part('year'::text, now()))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))))
                  GROUP BY (date_part('year'::text, atc.crash_date))
                UNION
                 SELECT date_part('year'::text, atc.crash_date) AS year,
                    sum(
                        CASE
                            WHEN (atpp.death_cnt > 0) THEN
                            CASE
                                WHEN (atpp.prsn_age >= 75) THEN 0
                                ELSE (75 - atpp.prsn_age)
                            END
                            ELSE 0
                        END) AS yll,
                    sum(atpp.death_cnt) AS death_cnt,
                    sum(atpp.sus_serious_injry_cnt) AS sus_serious_injry_cnt
                   FROM (public.atd_txdot_crashes atc
                     LEFT JOIN public.atd_txdot_person atpp ON ((atpp.crash_id = atc.crash_id)))
                  WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND ((atpp.death_cnt > 0) OR (atpp.sus_serious_injry_cnt > 0)) AND (((atc.crash_date >= (concat((date_part('year'::text, (now() - '1 year'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, (now() - '1 year'::interval)))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date)) OR ((atc.crash_date >= (concat((date_part('year'::text, now()))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))))
                  GROUP BY (date_part('year'::text, atc.crash_date))) people_1
          GROUP BY people_1.year) people
     LEFT JOIN ( SELECT date_part('year'::text, atc.crash_date) AS year,
            count(1) AS total_crashes
           FROM public.atd_txdot_crashes atc
          WHERE ((1 = 1) AND (((atc.austin_full_purpose)::text = 'Y'::text) OR ((atc.city_id = 22) AND (atc."position" IS NULL))) AND (((atc.crash_date >= (concat((date_part('year'::text, (now() - '1 year'::interval)))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, (now() - '1 year'::interval)))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date)) OR ((atc.crash_date >= (concat((date_part('year'::text, now()))::text, '-01-01'))::date) AND (atc.crash_date < (concat((date_part('year'::text, now()))::text, '-', lpad((date_part('month'::text, (now() - '1 mon'::interval)))::text, 2, '0'::text), '-01'))::date))))
          GROUP BY (date_part('year'::text, atc.crash_date))) crashes ON ((crashes.year = people.year)));


ALTER TABLE public.view_vzv_header_totals OWNER TO atd_vz_data;

--
-- Name: atd_apd_blueform form_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_apd_blueform ALTER COLUMN form_id SET DEFAULT nextval('public.atd_apd_blueform_form_id_seq'::regclass);


--
-- Name: atd_jurisdictions id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_jurisdictions ALTER COLUMN id SET DEFAULT nextval('public.atd_jurisdictions_id_seq'::regclass);


--
-- Name: atd_txdot__est_comp_cost_crash_based est_comp_cost_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__est_comp_cost_crash_based ALTER COLUMN est_comp_cost_id SET DEFAULT nextval('public.atd_txdot__est_comp_cost_crash_based_est_comp_cost_id_seq'::regclass);


--
-- Name: atd_txdot_change_log change_log_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_log ALTER COLUMN change_log_id SET DEFAULT nextval('public.atd_txdot_change_log_id_seq'::regclass);


--
-- Name: atd_txdot_change_pending id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_pending ALTER COLUMN id SET DEFAULT nextval('public.atd_txdot_change_pending_id_seq'::regclass);


--
-- Name: atd_txdot_change_status change_status_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_status ALTER COLUMN change_status_id SET DEFAULT nextval('public.atd_txdot_change_status_change_status_id_seq'::regclass);


--
-- Name: atd_txdot_changes change_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_changes ALTER COLUMN change_id SET DEFAULT nextval('public.atd_txdot_changes_change_id_seq'::regclass);


--
-- Name: atd_txdot_charges charge_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges ALTER COLUMN charge_id SET DEFAULT nextval('public.atd_txdot_charges_id_seq'::regclass);


--
-- Name: atd_txdot_crash_locations crash_location_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_locations ALTER COLUMN crash_location_id SET DEFAULT nextval('public.atd_txdot_crash_locations_crash_location_id_seq'::regclass);


--
-- Name: atd_txdot_crash_status crash_status_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_status ALTER COLUMN crash_status_id SET DEFAULT nextval('public.atd_txdot_crash_status_crash_status_id_seq'::regclass);


--
-- Name: atd_txdot_geocoders geocoder_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_geocoders ALTER COLUMN geocoder_id SET DEFAULT nextval('public.atd_txdot_geocoders_geocoder_id_seq'::regclass);


--
-- Name: atd_txdot_locations_change_log change_log_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations_change_log ALTER COLUMN change_log_id SET DEFAULT nextval('public.atd_txdot_locations_change_log_id_seq'::regclass);


--
-- Name: atd_txdot_person person_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_person ALTER COLUMN person_id SET DEFAULT nextval('public.atd_txdot_person_person_id_seq'::regclass);


--
-- Name: atd_txdot_primaryperson primaryperson_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_primaryperson ALTER COLUMN primaryperson_id SET DEFAULT nextval('public.atd_txdot_primaryperson_primaryperson_id_seq'::regclass);


--
-- Name: atd_txdot_units unit_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_units ALTER COLUMN unit_id SET DEFAULT nextval('public.atd_txdot_units_unit_id_seq'::regclass);


--
-- Name: atd_txdot_units_temp unit_id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_units_temp ALTER COLUMN unit_id SET DEFAULT nextval('public.atd_txdot_units_temp_unit_id_seq'::regclass);


--
-- Name: council_districts gid; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.council_districts ALTER COLUMN gid SET DEFAULT nextval('public.council_districts_gid_seq'::regclass);


--
-- Name: hin_corridors id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.hin_corridors ALTER COLUMN id SET DEFAULT nextval('public.hin_corridors_id_seq'::regclass);


--
-- Name: atd_txdot_locations atd_txdot_locations_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations
    ADD CONSTRAINT atd_txdot_locations_pk PRIMARY KEY (location_id);


--
-- Name: five_year_highway_polygons_with_crash_data; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_highway_polygons_with_crash_data AS
 SELECT p.location_id,
    p.road,
    p.intersection,
    p.road_name,
    p.level_1,
    p.level_2,
    p.level_3,
    p.level_4,
    p.level_5,
    p.street_level,
    p.is_intersection,
    p.council_district,
    p.sidewalk_score,
    p.bicycle_score,
    p.transit_score,
    p.community_dest_score,
    p.minority_score,
    p.poverty_score,
    sum(c.sus_serious_injry_cnt) AS total_sus_serious_injry_cnt,
    sum(c.nonincap_injry_cnt) AS total_nonincap_injry_cnt,
    sum(c.poss_injry_cnt) AS total_poss_injry_cnt,
    sum(c.non_injry_cnt) AS total_non_injry_cnt,
    sum(c.unkn_injry_cnt) AS total_unkn_injry_cnt,
    sum(c.tot_injry_cnt) AS total_tot_injry_cnt,
    sum(c.death_cnt) AS total_death_cnt,
    sum(c.est_comp_cost) AS sum_comp_cost,
    sum(c.est_econ_cost) AS sum_econ_cost,
    sum(c.non_cr3) AS non_cr3_count,
    sum(c.cr3) AS cr3_count,
    (sum(c.non_cr3) + sum(c.cr3)) AS total_crash_count,
    p.geometry
   FROM (public.atd_txdot_locations p
     LEFT JOIN public.five_year_all_crashes_outside_surface_polygons c ON (((c.geometry OPERATOR(public.&&) p.geometry) AND public.st_contains(p.geometry, c.geometry))))
  WHERE (p.location_group = 2)
  GROUP BY p.location_id
  WITH NO DATA;


ALTER TABLE public.five_year_highway_polygons_with_crash_data OWNER TO atd_vz_data;

--
-- Name: five_year_surface_polygons_with_crash_data; Type: MATERIALIZED VIEW; Schema: public; Owner: atd_vz_data
--

CREATE MATERIALIZED VIEW public.five_year_surface_polygons_with_crash_data AS
 SELECT p.location_id,
    p.road,
    p.intersection,
    p.road_name,
    p.level_1,
    p.level_2,
    p.level_3,
    p.level_4,
    p.level_5,
    p.street_level,
    p.is_intersection,
    p.council_district,
    p.sidewalk_score,
    p.bicycle_score,
    p.transit_score,
    p.community_dest_score,
    p.minority_score,
    p.poverty_score,
    p.community_context_score,
    sum(c.sus_serious_injry_cnt) AS total_sus_serious_injry_cnt,
    sum(c.nonincap_injry_cnt) AS total_nonincap_injry_cnt,
    sum(c.poss_injry_cnt) AS total_poss_injry_cnt,
    sum(c.non_injry_cnt) AS total_non_injry_cnt,
    sum(c.unkn_injry_cnt) AS total_unkn_injry_cnt,
    sum(c.tot_injry_cnt) AS total_tot_injry_cnt,
    sum(c.death_cnt) AS total_death_cnt,
    sum(c.est_comp_cost) AS sum_comp_cost,
    sum(c.est_econ_cost) AS sum_econ_cost,
    sum(c.non_cr3) AS non_cr3_count,
    sum(c.cr3) AS cr3_count,
    (sum(c.non_cr3) + sum(c.cr3)) AS total_crash_count,
    p.geometry
   FROM (public.atd_txdot_locations p
     LEFT JOIN public.five_year_all_crashes_off_mainlane c ON (((c.geometry OPERATOR(public.&&) p.geometry) AND public.st_contains(p.geometry, c.geometry))))
  WHERE (p.location_group = 1)
  GROUP BY p.location_id
  WITH NO DATA;


ALTER TABLE public.five_year_surface_polygons_with_crash_data OWNER TO atd_vz_data;

--
-- Name: atd_txdot__agency_lkp agency_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__agency_lkp
    ADD CONSTRAINT agency_lkp_pk PRIMARY KEY (agency_id);


--
-- Name: atd__mode_category_lkp atd__mode_category_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd__mode_category_lkp
    ADD CONSTRAINT atd__mode_category_lkp_pkey PRIMARY KEY (id);


--
-- Name: atd_apd_blueform atd_apd_blueform_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_apd_blueform
    ADD CONSTRAINT atd_apd_blueform_pk PRIMARY KEY (case_id);


--
-- Name: atd_location_crash_and_cost_totals atd_location_crash_and_cost_totals_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_location_crash_and_cost_totals
    ADD CONSTRAINT atd_location_crash_and_cost_totals_pkey PRIMARY KEY (location_id);


--
-- Name: atd_txdot__airbag_lkp atd_txdot__airbag_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__airbag_lkp
    ADD CONSTRAINT atd_txdot__airbag_lkp_pk PRIMARY KEY (airbag_id);


--
-- Name: atd_txdot__asmp_level_lkp atd_txdot__asmp_level_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__asmp_level_lkp
    ADD CONSTRAINT atd_txdot__asmp_level_lkp_pkey PRIMARY KEY (asmp_level_id);


--
-- Name: atd_txdot__base_type_lkp atd_txdot__base_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__base_type_lkp
    ADD CONSTRAINT atd_txdot__base_type_lkp_pk PRIMARY KEY (base_type_id);


--
-- Name: atd_txdot__bridge_detail_lkp atd_txdot__bridge_detail_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_detail_lkp
    ADD CONSTRAINT atd_txdot__bridge_detail_lkp_pk PRIMARY KEY (bridge_detail_id);


--
-- Name: atd_txdot__bridge_dir_of_traffic_lkp atd_txdot__bridge_dir_of_traffic_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_dir_of_traffic_lkp
    ADD CONSTRAINT atd_txdot__bridge_dir_of_traffic_lkp_pk PRIMARY KEY (bridge_dir_of_traffic_id);


--
-- Name: atd_txdot__bridge_ir_struct_func_lkp atd_txdot__bridge_ir_struct_func_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_ir_struct_func_lkp
    ADD CONSTRAINT atd_txdot__bridge_ir_struct_func_lkp_pk PRIMARY KEY (bridge_ir_struct_func_id);


--
-- Name: atd_txdot__bridge_loading_type_lkp atd_txdot__bridge_loading_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_loading_type_lkp
    ADD CONSTRAINT atd_txdot__bridge_loading_type_lkp_pk PRIMARY KEY (bridge_loading_type_id);


--
-- Name: atd_txdot__bridge_median_lkp atd_txdot__bridge_median_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_median_lkp
    ADD CONSTRAINT atd_txdot__bridge_median_lkp_pk PRIMARY KEY (bridge_median_id);


--
-- Name: atd_txdot__bridge_rte_struct_func_lkp atd_txdot__bridge_rte_struct_func_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_rte_struct_func_lkp
    ADD CONSTRAINT atd_txdot__bridge_rte_struct_func_lkp_pk PRIMARY KEY (bridge_rte_struct_func_id);


--
-- Name: atd_txdot__bridge_srvc_type_on_lkp atd_txdot__bridge_srvc_type_on_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_srvc_type_on_lkp
    ADD CONSTRAINT atd_txdot__bridge_srvc_type_on_lkp_pk PRIMARY KEY (bridge_srvc_type_on_id);


--
-- Name: atd_txdot__bridge_srvc_type_under_lkp atd_txdot__bridge_srvc_type_under_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bridge_srvc_type_under_lkp
    ADD CONSTRAINT atd_txdot__bridge_srvc_type_under_lkp_pk PRIMARY KEY (bridge_srvc_type_under_id);


--
-- Name: atd_txdot__bus_type_lkp atd_txdot__bus_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__bus_type_lkp
    ADD CONSTRAINT atd_txdot__bus_type_lkp_pk PRIMARY KEY (bus_type_id);


--
-- Name: atd_txdot__carrier_id_type_lkp atd_txdot__carrier_id_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__carrier_id_type_lkp
    ADD CONSTRAINT atd_txdot__carrier_id_type_lkp_pk PRIMARY KEY (carrier_id_type_id);


--
-- Name: atd_txdot__carrier_type_lkp atd_txdot__carrier_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__carrier_type_lkp
    ADD CONSTRAINT atd_txdot__carrier_type_lkp_pk PRIMARY KEY (carrier_type_id);


--
-- Name: atd_txdot__cas_transp_locat_lkp atd_txdot__cas_transp_locat_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cas_transp_locat_lkp
    ADD CONSTRAINT atd_txdot__cas_transp_locat_lkp_pk PRIMARY KEY (cas_transp_locat_id);


--
-- Name: atd_txdot__cas_transp_name_lkp atd_txdot__cas_transp_name_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cas_transp_name_lkp
    ADD CONSTRAINT atd_txdot__cas_transp_name_lkp_pk PRIMARY KEY (cas_transp_name_id);


--
-- Name: atd_txdot__charge_cat_lkp atd_txdot__charge_cat_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__charge_cat_lkp
    ADD CONSTRAINT atd_txdot__charge_cat_lkp_pk PRIMARY KEY (charge_cat_id);


--
-- Name: atd_txdot__city_lkp atd_txdot__city_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__city_lkp
    ADD CONSTRAINT atd_txdot__city_lkp_pk PRIMARY KEY (city_id);


--
-- Name: atd_txdot__cmv_cargo_body_lkp atd_txdot__cmv_cargo_body_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cmv_cargo_body_lkp
    ADD CONSTRAINT atd_txdot__cmv_cargo_body_lkp_pk PRIMARY KEY (cmv_cargo_body_id);


--
-- Name: atd_txdot__cmv_event_lkp atd_txdot__cmv_evnt_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cmv_event_lkp
    ADD CONSTRAINT atd_txdot__cmv_evnt_lkp_pk PRIMARY KEY (cmv_event_id);


--
-- Name: atd_txdot__cmv_road_acc_lkp atd_txdot__cmv_road_acc_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cmv_road_acc_lkp
    ADD CONSTRAINT atd_txdot__cmv_road_acc_lkp_pk PRIMARY KEY (cmv_road_acc_id);


--
-- Name: atd_txdot__cmv_trlr_type_lkp atd_txdot__cmv_trlr_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cmv_trlr_type_lkp
    ADD CONSTRAINT atd_txdot__cmv_trlr_type_lkp_pk PRIMARY KEY (cmv_trlr_type_id);


--
-- Name: atd_txdot__cmv_veh_oper_lkp atd_txdot__cmv_veh_oper_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cmv_veh_oper_lkp
    ADD CONSTRAINT atd_txdot__cmv_veh_oper_lkp_pk PRIMARY KEY (cmv_veh_oper_id);


--
-- Name: atd_txdot__cmv_veh_type_lkp atd_txdot__cmv_veh_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cmv_veh_type_lkp
    ADD CONSTRAINT atd_txdot__cmv_veh_type_lkp_pk PRIMARY KEY (cmv_veh_type_id);


--
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_district; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_district UNIQUE (dps_district_id);


--
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_dps_district; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_dps_district UNIQUE (txdot_district_id);


--
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_region; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_region UNIQUE (dps_region_id);


--
-- Name: atd_txdot__cntl_sect_lkp atd_txdot__cntl_sect_lkp_road; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cntl_sect_lkp
    ADD CONSTRAINT atd_txdot__cntl_sect_lkp_road UNIQUE (road_id);


--
-- Name: atd_txdot__cnty_lkp atd_txdot__cnty_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__cnty_lkp
    ADD CONSTRAINT atd_txdot__cnty_lkp_pk PRIMARY KEY (cnty_id);


--
-- Name: atd_txdot__collsn_lkp atd_txdot__collsn_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__collsn_lkp
    ADD CONSTRAINT atd_txdot__collsn_lkp_pk PRIMARY KEY (collsn_id);


--
-- Name: atd_txdot__contrib_factr_lkp atd_txdot__contrib_factr_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__contrib_factr_lkp
    ADD CONSTRAINT atd_txdot__contrib_factr_lkp_pk PRIMARY KEY (contrib_factr_id);


--
-- Name: atd_txdot__crash_sev_lkp atd_txdot__crash_sev_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__crash_sev_lkp
    ADD CONSTRAINT atd_txdot__crash_sev_lkp_pk PRIMARY KEY (crash_sev_id);


--
-- Name: atd_txdot__culvert_type_lkp atd_txdot__culvert_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__culvert_type_lkp
    ADD CONSTRAINT atd_txdot__culvert_type_lkp_pk PRIMARY KEY (culvert_type_id);


--
-- Name: atd_txdot__curb_type_lkp atd_txdot__curb_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__curb_type_lkp
    ADD CONSTRAINT atd_txdot__curb_type_lkp_pk PRIMARY KEY (curb_type_id);


--
-- Name: atd_txdot__curve_type_lkp atd_txdot__curve_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__curve_type_lkp
    ADD CONSTRAINT atd_txdot__curve_type_lkp_pk PRIMARY KEY (curve_type_id);


--
-- Name: atd_txdot__delta_left_right_lkp atd_txdot__delta_left_right_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__delta_left_right_lkp
    ADD CONSTRAINT atd_txdot__delta_left_right_lkp_pk PRIMARY KEY (delta_left_right_id);


--
-- Name: atd_txdot__drug_category_lkp atd_txdot__drug_category_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__drug_category_lkp
    ADD CONSTRAINT atd_txdot__drug_category_lkp_pk PRIMARY KEY (drug_category_id);


--
-- Name: atd_txdot__drvr_ethncty_lkp atd_txdot__drvr_ethncty_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__drvr_ethncty_lkp
    ADD CONSTRAINT atd_txdot__drvr_ethncty_lkp_pk PRIMARY KEY (drvr_ethncty_id);


--
-- Name: atd_txdot__drvr_lic_cls_lkp atd_txdot__drvr_lic_cls_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__drvr_lic_cls_lkp
    ADD CONSTRAINT atd_txdot__drvr_lic_cls_lkp_pk PRIMARY KEY (drvr_lic_cls_id);


--
-- Name: atd_txdot__drvr_lic_endors_lkp atd_txdot__drvr_lic_endors_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__drvr_lic_endors_lkp
    ADD CONSTRAINT atd_txdot__drvr_lic_endors_lkp_pk PRIMARY KEY (drvr_lic_endors_id);


--
-- Name: atd_txdot__drvr_lic_restric_lkp atd_txdot__drvr_lic_restric_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__drvr_lic_restric_lkp
    ADD CONSTRAINT atd_txdot__drvr_lic_restric_lkp_pk PRIMARY KEY (drvr_lic_restric_id);


--
-- Name: atd_txdot__drvr_lic_type_lkp atd_txdot__drvr_lic_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__drvr_lic_type_lkp
    ADD CONSTRAINT atd_txdot__drvr_lic_type_lkp_pk PRIMARY KEY (drvr_lic_type_id);


--
-- Name: atd_txdot__ejct_lkp atd_txdot__ejct_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__ejct_lkp
    ADD CONSTRAINT atd_txdot__ejct_lkp_pk PRIMARY KEY (ejct_id);


--
-- Name: atd_txdot__entr_road_lkp atd_txdot__entr_road_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__entr_road_lkp
    ADD CONSTRAINT atd_txdot__entr_road_lkp_pk PRIMARY KEY (entr_road_id);


--
-- Name: atd_txdot__est_comp_cost_crash_based atd_txdot__est_comp_cost_crash_based_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__est_comp_cost_crash_based
    ADD CONSTRAINT atd_txdot__est_comp_cost_crash_based_pkey PRIMARY KEY (est_comp_cost_id);


--
-- Name: atd_txdot__est_comp_cost atd_txdot__est_comp_cost_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__est_comp_cost
    ADD CONSTRAINT atd_txdot__est_comp_cost_pk PRIMARY KEY (est_comp_cost_id);


--
-- Name: atd_txdot__est_econ_cost atd_txdot__est_econ_cost_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__est_econ_cost
    ADD CONSTRAINT atd_txdot__est_econ_cost_pk PRIMARY KEY (est_econ_cost_id);


--
-- Name: atd_txdot__ethnicity_lkp atd_txdot__ethnicity_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__ethnicity_lkp
    ADD CONSTRAINT atd_txdot__ethnicity_lkp_pk PRIMARY KEY (ethnicity_id);


--
-- Name: atd_txdot__func_sys_lkp atd_txdot__func_sys_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__func_sys_lkp
    ADD CONSTRAINT atd_txdot__func_sys_lkp_pk PRIMARY KEY (func_sys_id);


--
-- Name: atd_txdot__gndr_lkp atd_txdot__gndr_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__gndr_lkp
    ADD CONSTRAINT atd_txdot__gndr_lkp_pk PRIMARY KEY (gndr_id);


--
-- Name: atd_txdot__harm_evnt_lkp atd_txdot__harm_evnt_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__harm_evnt_lkp
    ADD CONSTRAINT atd_txdot__harm_evnt_lkp_pk PRIMARY KEY (harm_evnt_id);


--
-- Name: atd_txdot__hazmat_cls_lkp atd_txdot__hazmat_cls_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__hazmat_cls_lkp
    ADD CONSTRAINT atd_txdot__hazmat_cls_lkp_pk PRIMARY KEY (hazmat_cls_id);


--
-- Name: atd_txdot__hazmat_idnbr_lkp atd_txdot__hazmat_idnbr_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__hazmat_idnbr_lkp
    ADD CONSTRAINT atd_txdot__hazmat_idnbr_lkp_pk PRIMARY KEY (hazmat_idnbr_id);


--
-- Name: atd_txdot__helmet_lkp atd_txdot__helmet_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__helmet_lkp
    ADD CONSTRAINT atd_txdot__helmet_lkp_pk PRIMARY KEY (helmet_id);


--
-- Name: atd_txdot__hwy_dsgn_hrt_lkp atd_txdot__hwy_dsgn_hrt_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__hwy_dsgn_hrt_lkp
    ADD CONSTRAINT atd_txdot__hwy_dsgn_hrt_lkp_pk PRIMARY KEY (hwy_dsgn_hrt_id);


--
-- Name: atd_txdot__hwy_dsgn_lane_lkp atd_txdot__hwy_dsgn_lane_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__hwy_dsgn_lane_lkp
    ADD CONSTRAINT atd_txdot__hwy_dsgn_lane_lkp_pk PRIMARY KEY (hwy_dsgn_lane_id);


--
-- Name: atd_txdot__hwy_sys_lkp atd_txdot__hwy_sys_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__hwy_sys_lkp
    ADD CONSTRAINT atd_txdot__hwy_sys_lkp_pk PRIMARY KEY (hwy_sys_id);


--
-- Name: atd_txdot__injry_sev_lkp atd_txdot__injry_sev_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__injry_sev_lkp
    ADD CONSTRAINT atd_txdot__injry_sev_lkp_pk PRIMARY KEY (injry_sev_id);


--
-- Name: atd_txdot__ins_co_name_lkp atd_txdot__ins_co_name_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__ins_co_name_lkp
    ADD CONSTRAINT atd_txdot__ins_co_name_lkp_pk PRIMARY KEY (ins_co_name_id);


--
-- Name: atd_txdot__ins_proof_lkp atd_txdot__ins_proof_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__ins_proof_lkp
    ADD CONSTRAINT atd_txdot__ins_proof_lkp_pk PRIMARY KEY (ins_proof_id);


--
-- Name: atd_txdot__ins_type_lkp atd_txdot__ins_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__ins_type_lkp
    ADD CONSTRAINT atd_txdot__ins_type_lkp_pk PRIMARY KEY (ins_type_id);


--
-- Name: atd_txdot__insurance_proof_lkp atd_txdot__insurance_proof_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__insurance_proof_lkp
    ADD CONSTRAINT atd_txdot__insurance_proof_lkp_pk PRIMARY KEY (insurance_proof_id);


--
-- Name: atd_txdot__insurance_type_lkp atd_txdot__insurance_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__insurance_type_lkp
    ADD CONSTRAINT atd_txdot__insurance_type_lkp_pk PRIMARY KEY (insurance_type_id);


--
-- Name: atd_txdot__intrsct_relat_lkp atd_txdot__intrsct_relat_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__intrsct_relat_lkp
    ADD CONSTRAINT atd_txdot__intrsct_relat_lkp_pk PRIMARY KEY (intrsct_relat_id);


--
-- Name: atd_txdot__inv_da_lkp atd_txdot__inv_da_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__inv_da_lkp
    ADD CONSTRAINT atd_txdot__inv_da_lkp_pk PRIMARY KEY (inv_da_id);


--
-- Name: atd_txdot__inv_notify_meth_lkp atd_txdot__inv_notify_meth_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__inv_notify_meth_lkp
    ADD CONSTRAINT atd_txdot__inv_notify_meth_lkp_pk PRIMARY KEY (inv_notify_meth_id);


--
-- Name: atd_txdot__inv_region_lkp atd_txdot__inv_region_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__inv_region_lkp
    ADD CONSTRAINT atd_txdot__inv_region_lkp_pk PRIMARY KEY (inv_region_id);


--
-- Name: atd_txdot__inv_service_lkp atd_txdot__inv_service_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__inv_service_lkp
    ADD CONSTRAINT atd_txdot__inv_service_lkp_pk PRIMARY KEY (inv_service_id);


--
-- Name: atd_txdot__light_cond_lkp atd_txdot__light_cond_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__light_cond_lkp
    ADD CONSTRAINT atd_txdot__light_cond_lkp_pk PRIMARY KEY (light_cond_id);


--
-- Name: atd_txdot__median_type_lkp atd_txdot__median_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__median_type_lkp
    ADD CONSTRAINT atd_txdot__median_type_lkp_pk PRIMARY KEY (median_type_id);


--
-- Name: atd_txdot__movt_lkp atd_txdot__movt_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__movt_lkp
    ADD CONSTRAINT atd_txdot__movt_lkp_pkey PRIMARY KEY (movement_id);


--
-- Name: atd_txdot__mpo_lkp atd_txdot__mpo_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__mpo_lkp
    ADD CONSTRAINT atd_txdot__mpo_lkp_pk PRIMARY KEY (mpo_id);


--
-- Name: atd_txdot__nsew_dir_lkp atd_txdot__nsew_dir_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__nsew_dir_lkp
    ADD CONSTRAINT atd_txdot__nsew_dir_lkp_pk PRIMARY KEY (nsew_dir_id);


--
-- Name: atd_txdot__obj_struck_lkp atd_txdot__obj_struck_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__obj_struck_lkp
    ADD CONSTRAINT atd_txdot__obj_struck_lkp_pk PRIMARY KEY (obj_struck_id);


--
-- Name: atd_txdot__occpnt_pos_lkp atd_txdot__occpnt_pos_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__occpnt_pos_lkp
    ADD CONSTRAINT atd_txdot__occpnt_pos_lkp_pk PRIMARY KEY (occpnt_pos_id);


--
-- Name: atd_txdot__othr_factr_lkp atd_txdot__othr_factr_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__othr_factr_lkp
    ADD CONSTRAINT atd_txdot__othr_factr_lkp_pk PRIMARY KEY (othr_factr_id);


--
-- Name: atd_txdot__phys_featr_lkp atd_txdot__phys_featr_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__phys_featr_lkp
    ADD CONSTRAINT atd_txdot__phys_featr_lkp_pk PRIMARY KEY (phys_featr_id);


--
-- Name: atd_txdot__pop_group_lkp atd_txdot__pop_group_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__pop_group_lkp
    ADD CONSTRAINT atd_txdot__pop_group_lkp_pk PRIMARY KEY (pop_group_id);


--
-- Name: atd_txdot__poscrossing_lkp atd_txdot__poscrossing_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__poscrossing_lkp
    ADD CONSTRAINT atd_txdot__poscrossing_lkp_pk PRIMARY KEY (poscrossing_id);


--
-- Name: atd_txdot__prsn_type_lkp atd_txdot__prsn_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__prsn_type_lkp
    ADD CONSTRAINT atd_txdot__prsn_type_lkp_pk PRIMARY KEY (prsn_type_id);


--
-- Name: atd_txdot__ref_mark_nbr_lkp atd_txdot__ref_mark_nbr_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__ref_mark_nbr_lkp
    ADD CONSTRAINT atd_txdot__ref_mark_nbr_lkp_pk PRIMARY KEY (ref_mark_nbr_id);


--
-- Name: atd_txdot__rest_lkp atd_txdot__rest_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__rest_lkp
    ADD CONSTRAINT atd_txdot__rest_lkp_pk PRIMARY KEY (rest_id);


--
-- Name: atd_txdot__road_algn_lkp atd_txdot__road_algn_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__road_algn_lkp
    ADD CONSTRAINT atd_txdot__road_algn_lkp_pk PRIMARY KEY (road_algn_id);


--
-- Name: atd_txdot__road_cls_lkp atd_txdot__road_cls_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__road_cls_lkp
    ADD CONSTRAINT atd_txdot__road_cls_lkp_pk PRIMARY KEY (road_cls_id);


--
-- Name: atd_txdot__road_part_lkp atd_txdot__road_part_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__road_part_lkp
    ADD CONSTRAINT atd_txdot__road_part_lkp_pk PRIMARY KEY (road_part_id);


--
-- Name: atd_txdot__road_relat_lkp atd_txdot__road_relat_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__road_relat_lkp
    ADD CONSTRAINT atd_txdot__road_relat_lkp_pk PRIMARY KEY (road_relat_id);


--
-- Name: atd_txdot__road_type_lkp atd_txdot__road_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__road_type_lkp
    ADD CONSTRAINT atd_txdot__road_type_lkp_pk PRIMARY KEY (road_type_id);


--
-- Name: atd_txdot__rural_urban_lkp atd_txdot__rural_urban_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__rural_urban_lkp
    ADD CONSTRAINT atd_txdot__rural_urban_lkp_pk PRIMARY KEY (rural_urban_id);


--
-- Name: atd_txdot__rural_urban_type_lkp atd_txdot__rural_urban_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__rural_urban_type_lkp
    ADD CONSTRAINT atd_txdot__rural_urban_type_lkp_pk PRIMARY KEY (rural_urban_type_id);


--
-- Name: atd_txdot__rwy_sys_lkp atd_txdot__rwy_sys_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__rwy_sys_lkp
    ADD CONSTRAINT atd_txdot__rwy_sys_lkp_pk PRIMARY KEY (rwy_sys_id);


--
-- Name: atd_txdot__shldr_type_lkp atd_txdot__shldr_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__shldr_type_lkp
    ADD CONSTRAINT atd_txdot__shldr_type_lkp_pk PRIMARY KEY (shldr_type_id);


--
-- Name: atd_txdot__shldr_use_lkp atd_txdot__shldr_use_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__shldr_use_lkp
    ADD CONSTRAINT atd_txdot__shldr_use_lkp_pk PRIMARY KEY (shldr_use_id);


--
-- Name: atd_txdot__specimen_type_lkp atd_txdot__specimen_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__specimen_type_lkp
    ADD CONSTRAINT atd_txdot__specimen_type_lkp_pk PRIMARY KEY (specimen_type_id);


--
-- Name: atd_txdot__speed_mgmt_lkp atd_txdot__speed_mgmt_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__speed_mgmt_lkp
    ADD CONSTRAINT atd_txdot__speed_mgmt_lkp_pkey PRIMARY KEY (speed_mgmt_id);


--
-- Name: atd_txdot__state_lkp atd_txdot__state_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__state_lkp
    ADD CONSTRAINT atd_txdot__state_lkp_pk PRIMARY KEY (state_id);


--
-- Name: atd_txdot__street_sfx_lkp atd_txdot__street_sfx_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__street_sfx_lkp
    ADD CONSTRAINT atd_txdot__street_sfx_lkp_pk PRIMARY KEY (street_sfx_id);


--
-- Name: atd_txdot__substnc_cat_lkp atd_txdot__substnc_cat_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__substnc_cat_lkp
    ADD CONSTRAINT atd_txdot__substnc_cat_lkp_pk PRIMARY KEY (substnc_cat_id);


--
-- Name: atd_txdot__substnc_tst_result_lkp atd_txdot__substnc_tst_result_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__substnc_tst_result_lkp
    ADD CONSTRAINT atd_txdot__substnc_tst_result_lkp_pk PRIMARY KEY (substnc_tst_result_id);


--
-- Name: atd_txdot__surf_cond_lkp atd_txdot__surf_cond_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__surf_cond_lkp
    ADD CONSTRAINT atd_txdot__surf_cond_lkp_pk PRIMARY KEY (surf_cond_id);


--
-- Name: atd_txdot__surf_type_lkp atd_txdot__surf_type_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__surf_type_lkp
    ADD CONSTRAINT atd_txdot__surf_type_lkp_pk PRIMARY KEY (surf_type_id);


--
-- Name: atd_txdot__traffic_cntl_lkp atd_txdot__traffic_cntl_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__traffic_cntl_lkp
    ADD CONSTRAINT atd_txdot__traffic_cntl_lkp_pk PRIMARY KEY (traffic_cntl_id);


--
-- Name: atd_txdot__trvl_dir_lkp atd_txdot__trvl_dir_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__trvl_dir_lkp
    ADD CONSTRAINT atd_txdot__trvl_dir_lkp_pk PRIMARY KEY (trvl_dir_id);


--
-- Name: atd_txdot__tst_result_lkp atd_txdot__tst_result_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__tst_result_lkp
    ADD CONSTRAINT atd_txdot__tst_result_lkp_pk PRIMARY KEY (tst_result_id);


--
-- Name: atd_txdot__unit_desc_lkp atd_txdot__unit_desc_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__unit_desc_lkp
    ADD CONSTRAINT atd_txdot__unit_desc_lkp_pk PRIMARY KEY (unit_desc_id);


--
-- Name: atd_txdot__unit_dfct_lkp atd_txdot__unit_dfct_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__unit_dfct_lkp
    ADD CONSTRAINT atd_txdot__unit_dfct_lkp_pk PRIMARY KEY (unit_dfct_id);


--
-- Name: atd_txdot__uom_lkp atd_txdot__uom_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__uom_lkp
    ADD CONSTRAINT atd_txdot__uom_lkp_pk PRIMARY KEY (uom_id);


--
-- Name: atd_txdot__veh_body_styl_lkp atd_txdot__veh_body_styl_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_body_styl_lkp
    ADD CONSTRAINT atd_txdot__veh_body_styl_lkp_pk PRIMARY KEY (veh_body_styl_id);


--
-- Name: atd_txdot__veh_color_lkp atd_txdot__veh_color_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_color_lkp
    ADD CONSTRAINT atd_txdot__veh_color_lkp_pk PRIMARY KEY (veh_color_id);


--
-- Name: atd_txdot__veh_damage_severity_lkp atd_txdot__veh_damage_severity_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_damage_severity_lkp
    ADD CONSTRAINT atd_txdot__veh_damage_severity_lkp_pk PRIMARY KEY (veh_damage_severity_id);


--
-- Name: atd_txdot__veh_direction_of_force_lkp atd_txdot__veh_direction_of_force_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_direction_of_force_lkp
    ADD CONSTRAINT atd_txdot__veh_direction_of_force_lkp_pk PRIMARY KEY (veh_direction_of_force_id);


--
-- Name: atd_txdot__veh_make_lkp atd_txdot__veh_make_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_make_lkp
    ADD CONSTRAINT atd_txdot__veh_make_lkp_pk PRIMARY KEY (veh_make_id);


--
-- Name: atd_txdot__veh_trvl_dir_lkp atd_txdot__veh_trvl_dir_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_trvl_dir_lkp
    ADD CONSTRAINT atd_txdot__veh_trvl_dir_lkp_pk PRIMARY KEY (veh_trvl_dir_id);


--
-- Name: atd_txdot__veh_unit_desc_lkp atd_txdot__veh_unit_desc_lkp_VEH_UNIT_DESC_ID_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_unit_desc_lkp
    ADD CONSTRAINT "atd_txdot__veh_unit_desc_lkp_VEH_UNIT_DESC_ID_key" UNIQUE (veh_unit_desc_id);


--
-- Name: atd_txdot__veh_unit_desc_lkp atd_txdot__veh_unit_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_unit_desc_lkp
    ADD CONSTRAINT atd_txdot__veh_unit_lkp_pkey PRIMARY KEY (veh_unit_desc_id);


--
-- Name: atd_txdot__wdcode_lkp atd_txdot__wdcode_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__wdcode_lkp
    ADD CONSTRAINT atd_txdot__wdcode_lkp_pk PRIMARY KEY (wdcode_id);


--
-- Name: atd_txdot__wthr_cond_lkp atd_txdot__wthr_cond_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__wthr_cond_lkp
    ADD CONSTRAINT atd_txdot__wthr_cond_lkp_pk PRIMARY KEY (wthr_cond_id);


--
-- Name: atd_txdot__y_n_lkp atd_txdot__y_n_lkp_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__y_n_lkp
    ADD CONSTRAINT atd_txdot__y_n_lkp_pkey PRIMARY KEY (y_n_id);


--
-- Name: atd_txdot__yes_no_choice_lkp atd_txdot__yes_no_choice_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__yes_no_choice_lkp
    ADD CONSTRAINT atd_txdot__yes_no_choice_lkp_pk PRIMARY KEY (yes_no_choice_id);


--
-- Name: atd_txdot_change_log atd_txdot_change_log_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_log
    ADD CONSTRAINT atd_txdot_change_log_id_key UNIQUE (change_log_id);


--
-- Name: atd_txdot_change_log atd_txdot_change_log_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_log
    ADD CONSTRAINT atd_txdot_change_log_pk PRIMARY KEY (change_log_id);


--
-- Name: atd_txdot_change_pending atd_txdot_change_pending_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_pending
    ADD CONSTRAINT atd_txdot_change_pending_pk PRIMARY KEY (id);


--
-- Name: atd_txdot_change_status atd_txdot_change_status_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_change_status
    ADD CONSTRAINT atd_txdot_change_status_pk PRIMARY KEY (change_status_id);


--
-- Name: atd_txdot_changes atd_txdot_changes_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_changes
    ADD CONSTRAINT atd_txdot_changes_pk PRIMARY KEY (change_id);


--
-- Name: atd_txdot_changes atd_txdot_changes_unique; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_changes
    ADD CONSTRAINT atd_txdot_changes_unique UNIQUE (record_id, record_type, record_uqid, status_id);


--
-- Name: atd_txdot_charges atd_txdot_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges
    ADD CONSTRAINT atd_txdot_charges_pkey PRIMARY KEY (charge_id);


--
-- Name: atd_txdot_charges atd_txdot_charges_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges
    ADD CONSTRAINT atd_txdot_charges_unique_id_key UNIQUE (charge_id);


--
-- Name: atd_txdot_cities atd_txdot_cities_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_cities
    ADD CONSTRAINT atd_txdot_cities_pk PRIMARY KEY (city_id);


--
-- Name: atd_txdot_crash_locations atd_txdot_crash_locations_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_locations
    ADD CONSTRAINT atd_txdot_crash_locations_unique_id_key UNIQUE (crash_location_id);


--
-- Name: atd_txdot_crash_status atd_txdot_crash_status_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_status
    ADD CONSTRAINT atd_txdot_crash_status_pk PRIMARY KEY (crash_status_id);


--
-- Name: atd_txdot_crash_status atd_txdot_crash_status_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_status
    ADD CONSTRAINT atd_txdot_crash_status_unique_id_key UNIQUE (crash_status_id);


--
-- Name: atd_txdot_crash_locations atd_txdot_crashes_locations_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crash_locations
    ADD CONSTRAINT atd_txdot_crashes_locations_pk PRIMARY KEY (crash_location_id);


--
-- Name: atd_txdot_crashes atd_txdot_crashes_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_crashes
    ADD CONSTRAINT atd_txdot_crashes_pkey PRIMARY KEY (crash_id);


--
-- Name: atd_txdot_geocoders atd_txdot_geocoders_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_geocoders
    ADD CONSTRAINT atd_txdot_geocoders_pkey PRIMARY KEY (geocoder_id);


--
-- Name: atd_txdot_geocoders atd_txdot_geocoders_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_geocoders
    ADD CONSTRAINT atd_txdot_geocoders_unique_id_key UNIQUE (geocoder_id);


--
-- Name: atd_txdot_locations_change_log atd_txdot_location_change_log_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations_change_log
    ADD CONSTRAINT atd_txdot_location_change_log_pk PRIMARY KEY (change_log_id);


--
-- Name: atd_txdot_locations atd_txdot_locations_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_locations
    ADD CONSTRAINT atd_txdot_locations_unique_id_key UNIQUE (location_id);


--
-- Name: atd_txdot_person atd_txdot_person_unique; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_person
    ADD CONSTRAINT atd_txdot_person_unique UNIQUE (crash_id, unit_nbr, prsn_nbr, prsn_type_id, prsn_occpnt_pos_id);


--
-- Name: atd_txdot_primaryperson atd_txdot_primaryperson_unique; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_primaryperson
    ADD CONSTRAINT atd_txdot_primaryperson_unique UNIQUE (crash_id, unit_nbr, prsn_nbr, prsn_type_id, prsn_occpnt_pos_id);


--
-- Name: atd_txdot_streets atd_txdot_streets_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_streets
    ADD CONSTRAINT atd_txdot_streets_pk PRIMARY KEY (street_id);


--
-- Name: atd_txdot_streets atd_txdot_streets_street_id_key; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_streets
    ADD CONSTRAINT atd_txdot_streets_street_id_key UNIQUE (street_id);


--
-- Name: atd_txdot_units_temp atd_txdot_units_temp_unique; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_units_temp
    ADD CONSTRAINT atd_txdot_units_temp_unique UNIQUE (crash_id, unit_nbr);


--
-- Name: atd_txdot_units atd_txdot_units_unique; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_units
    ADD CONSTRAINT atd_txdot_units_unique UNIQUE (crash_id, unit_nbr);


--
-- Name: council_districts council_districts_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.council_districts
    ADD CONSTRAINT council_districts_pkey PRIMARY KEY (gid);


--
-- Name: cr3_mainlanes cr3_mainlanes_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.cr3_mainlanes
    ADD CONSTRAINT cr3_mainlanes_pkey PRIMARY KEY (gid);


--
-- Name: hin_corridors hin_corridors_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.hin_corridors
    ADD CONSTRAINT hin_corridors_pkey PRIMARY KEY (id);


--
-- Name: intersection_road_map intersection_road_map_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.intersection_road_map
    ADD CONSTRAINT intersection_road_map_pkey PRIMARY KEY (id);


--
-- Name: intersections intersections_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.intersections
    ADD CONSTRAINT intersections_pkey PRIMARY KEY (id);


--
-- Name: atd_jurisdictions jurisdictions_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_jurisdictions
    ADD CONSTRAINT jurisdictions_pkey PRIMARY KEY (id);


--
-- Name: non_cr3_mainlanes non_cr3_mainlane_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.non_cr3_mainlanes
    ADD CONSTRAINT non_cr3_mainlane_pkey PRIMARY KEY (gid);


--
-- Name: polygons polygons_pkey; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.polygons
    ADD CONSTRAINT polygons_pkey PRIMARY KEY (id);


--
-- Name: atd_txdot_charges uniq_atd_txdot_charges; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_charges
    ADD CONSTRAINT uniq_atd_txdot_charges UNIQUE (crash_id, unit_nbr, prsn_nbr, charge_cat_id, charge, citation_nbr);


--
-- Name: atd_txdot__veh_damage_description_lkp veh_damage_description_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_damage_description_lkp
    ADD CONSTRAINT veh_damage_description_lkp_pk PRIMARY KEY (veh_damage_description_id);


--
-- Name: atd_txdot__veh_mod_lkp veh_mod_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_mod_lkp
    ADD CONSTRAINT veh_mod_lkp_pk PRIMARY KEY (veh_mod_id);


--
-- Name: atd_txdot__veh_year_lkp veh_year_lkp_pk; Type: CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot__veh_year_lkp
    ADD CONSTRAINT veh_year_lkp_pk PRIMARY KEY (veh_mod_year);


--
-- Name: atd_apd_blueform_date_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_apd_blueform_date_index ON public.atd_apd_blueform USING btree (date);


--
-- Name: atd_apd_blueform_form_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_apd_blueform_form_id_index ON public.atd_apd_blueform USING btree (form_id);


--
-- Name: atd_apd_blueform_hour_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_apd_blueform_hour_index ON public.atd_apd_blueform USING btree (hour);


--
-- Name: atd_apd_blueform_latitude_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_apd_blueform_latitude_index ON public.atd_apd_blueform USING btree (latitude);


--
-- Name: atd_apd_blueform_location_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_apd_blueform_location_id_index ON public.atd_apd_blueform USING btree (location_id);


--
-- Name: atd_apd_blueform_longitude_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_apd_blueform_longitude_index ON public.atd_apd_blueform USING btree (longitude);


--
-- Name: atd_apd_blueform_position_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_apd_blueform_position_index ON public.atd_apd_blueform USING gist ("position");


--
-- Name: atd_txdot__collsn_lkp_collsn_id_uindex; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX atd_txdot__collsn_lkp_collsn_id_uindex ON public.atd_txdot__collsn_lkp USING btree (collsn_id);


--
-- Name: atd_txdot_change_log_record_crash_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_log_record_crash_id_index ON public.atd_txdot_change_log USING btree (record_crash_id);


--
-- Name: atd_txdot_change_log_record_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_log_record_id_index ON public.atd_txdot_change_log USING btree (record_id);


--
-- Name: atd_txdot_change_log_record_type_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_log_record_type_index ON public.atd_txdot_change_log USING btree (record_type);


--
-- Name: atd_txdot_change_pending_record_crash_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_pending_record_crash_id_index ON public.atd_txdot_change_pending USING btree (record_crash_id);


--
-- Name: atd_txdot_change_pending_record_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_pending_record_id_index ON public.atd_txdot_change_pending USING btree (record_id);


--
-- Name: atd_txdot_change_pending_record_type_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_change_pending_record_type_index ON public.atd_txdot_change_pending USING btree (record_type);


--
-- Name: atd_txdot_cities_city_id_uindex; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX atd_txdot_cities_city_id_uindex ON public.atd_txdot_cities USING btree (city_id);


--
-- Name: atd_txdot_crash_locations_crash_id_location_id_uindex; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX atd_txdot_crash_locations_crash_id_location_id_uindex ON public.atd_txdot_crash_locations USING btree (crash_id, location_id);


--
-- Name: atd_txdot_crashes_apd_confirmed_fatality_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_apd_confirmed_fatality_index ON public.atd_txdot_crashes USING btree (apd_confirmed_fatality);


--
-- Name: atd_txdot_crashes_austin_full_purpose_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_austin_full_purpose_index ON public.atd_txdot_crashes USING btree (austin_full_purpose);


--
-- Name: atd_txdot_crashes_case_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_case_id_index ON public.atd_txdot_crashes USING btree (case_id);


--
-- Name: atd_txdot_crashes_city_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_city_id_index ON public.atd_txdot_crashes USING btree (city_id);


--
-- Name: atd_txdot_crashes_cr3_file_metadata_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_cr3_file_metadata_index ON public.atd_txdot_crashes USING gin (cr3_file_metadata);


--
-- Name: atd_txdot_crashes_cr3_stored_flag_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_cr3_stored_flag_index ON public.atd_txdot_crashes USING btree (cr3_stored_flag);


--
-- Name: atd_txdot_crashes_crash_date_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_crash_date_index ON public.atd_txdot_crashes USING btree (crash_date);


--
-- Name: atd_txdot_crashes_crash_fatal_fl_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_crash_fatal_fl_index ON public.atd_txdot_crashes USING btree (crash_fatal_fl);


--
-- Name: atd_txdot_crashes_death_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_death_cnt_index ON public.atd_txdot_crashes USING btree (death_cnt);


--
-- Name: atd_txdot_crashes_geocode_provider_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_geocode_provider_index ON public.atd_txdot_crashes USING btree (geocode_provider);


--
-- Name: atd_txdot_crashes_geocode_status_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_geocode_status_index ON public.atd_txdot_crashes USING btree (geocode_status);


--
-- Name: atd_txdot_crashes_geocoded_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_geocoded_index ON public.atd_txdot_crashes USING btree (geocoded);


--
-- Name: atd_txdot_crashes_investigat_agency_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_investigat_agency_id_index ON public.atd_txdot_crashes USING btree (investigat_agency_id);


--
-- Name: atd_txdot_crashes_is_retired_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_is_retired_index ON public.atd_txdot_crashes USING btree (is_retired);


--
-- Name: atd_txdot_crashes_original_city_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_original_city_id_index ON public.atd_txdot_crashes USING btree (original_city_id);


--
-- Name: atd_txdot_crashes_position_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_position_index ON public.atd_txdot_crashes USING gist ("position");


--
-- Name: atd_txdot_crashes_qa_status_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_qa_status_index ON public.atd_txdot_crashes USING btree (qa_status);


--
-- Name: atd_txdot_crashes_sus_serious_injry_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_sus_serious_injry_cnt_index ON public.atd_txdot_crashes USING btree (sus_serious_injry_cnt);


--
-- Name: atd_txdot_crashes_temp_record_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_crashes_temp_record_index ON public.atd_txdot_crashes USING btree (temp_record);


--
-- Name: atd_txdot_locations_change_log_unique_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_change_log_unique_id_index ON public.atd_txdot_locations_change_log USING btree (location_id);


--
-- Name: atd_txdot_locations_geometry_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_geometry_index ON public.atd_txdot_locations USING gist (geometry);


--
-- Name: atd_txdot_locations_group_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_group_index ON public.atd_txdot_locations USING btree (location_group);


--
-- Name: atd_txdot_locations_level_1_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_level_1_index ON public.atd_txdot_locations USING btree (level_1);


--
-- Name: atd_txdot_locations_level_2_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_level_2_index ON public.atd_txdot_locations USING btree (level_2);


--
-- Name: atd_txdot_locations_level_3_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_level_3_index ON public.atd_txdot_locations USING btree (level_3);


--
-- Name: atd_txdot_locations_level_4_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_level_4_index ON public.atd_txdot_locations USING btree (level_4);


--
-- Name: atd_txdot_locations_level_5_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_level_5_index ON public.atd_txdot_locations USING btree (level_5);


--
-- Name: atd_txdot_locations_shape_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_locations_shape_index ON public.atd_txdot_locations USING gist (shape);


--
-- Name: atd_txdot_locations_unique_id_uindex; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE UNIQUE INDEX atd_txdot_locations_unique_id_uindex ON public.atd_txdot_locations USING btree (location_id);


--
-- Name: atd_txdot_person_death_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_death_cnt_index ON public.atd_txdot_person USING btree (death_cnt);


--
-- Name: atd_txdot_person_is_retired_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_is_retired_index ON public.atd_txdot_person USING btree (is_retired);


--
-- Name: atd_txdot_person_person_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_person_id_index ON public.atd_txdot_person USING btree (person_id);


--
-- Name: atd_txdot_person_prsn_age_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_prsn_age_index ON public.atd_txdot_person USING btree (prsn_age);


--
-- Name: atd_txdot_person_prsn_death_date_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_prsn_death_date_index ON public.atd_txdot_person USING btree (prsn_death_date);


--
-- Name: atd_txdot_person_prsn_death_time_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_prsn_death_time_index ON public.atd_txdot_person USING btree (prsn_death_time);


--
-- Name: atd_txdot_person_prsn_ethnicity_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_prsn_ethnicity_id_index ON public.atd_txdot_person USING btree (prsn_ethnicity_id);


--
-- Name: atd_txdot_person_prsn_gndr_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_prsn_gndr_id_index ON public.atd_txdot_person USING btree (prsn_gndr_id);


--
-- Name: atd_txdot_person_prsn_injry_sev_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_prsn_injry_sev_id_index ON public.atd_txdot_person USING btree (prsn_injry_sev_id);


--
-- Name: atd_txdot_person_sus_serious_injry_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_sus_serious_injry_cnt_index ON public.atd_txdot_person USING btree (sus_serious_injry_cnt);


--
-- Name: atd_txdot_person_years_of_life_lost_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_person_years_of_life_lost_index ON public.atd_txdot_person USING btree (years_of_life_lost);


--
-- Name: atd_txdot_primaryperson_death_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_death_cnt_index ON public.atd_txdot_primaryperson USING btree (death_cnt);


--
-- Name: atd_txdot_primaryperson_is_retired_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_is_retired_index ON public.atd_txdot_primaryperson USING btree (is_retired);


--
-- Name: atd_txdot_primaryperson_primaryperson_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_primaryperson_id_index ON public.atd_txdot_primaryperson USING btree (primaryperson_id);


--
-- Name: atd_txdot_primaryperson_prsn_age_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_prsn_age_index ON public.atd_txdot_primaryperson USING btree (prsn_age);


--
-- Name: atd_txdot_primaryperson_prsn_death_date_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_prsn_death_date_index ON public.atd_txdot_primaryperson USING btree (prsn_death_date);


--
-- Name: atd_txdot_primaryperson_prsn_death_time_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_prsn_death_time_index ON public.atd_txdot_primaryperson USING btree (prsn_death_time);


--
-- Name: atd_txdot_primaryperson_prsn_ethnicity_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_prsn_ethnicity_id_index ON public.atd_txdot_primaryperson USING btree (prsn_ethnicity_id);


--
-- Name: atd_txdot_primaryperson_prsn_gndr_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_prsn_gndr_id_index ON public.atd_txdot_primaryperson USING btree (prsn_gndr_id);


--
-- Name: atd_txdot_primaryperson_prsn_injry_sev_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_prsn_injry_sev_id_index ON public.atd_txdot_primaryperson USING btree (prsn_injry_sev_id);


--
-- Name: atd_txdot_primaryperson_sus_serious_injry_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_sus_serious_injry_cnt_index ON public.atd_txdot_primaryperson USING btree (sus_serious_injry_cnt);


--
-- Name: atd_txdot_primaryperson_years_of_life_lost_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_primaryperson_years_of_life_lost_index ON public.atd_txdot_primaryperson USING btree (years_of_life_lost);


--
-- Name: atd_txdot_streets_full_streer_name_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_streets_full_streer_name_index ON public.atd_txdot_streets USING btree (full_street_name);


--
-- Name: atd_txdot_streets_segment_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_streets_segment_id_index ON public.atd_txdot_streets USING btree (segment_id);


--
-- Name: atd_txdot_streets_street_place_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_streets_street_place_id_index ON public.atd_txdot_streets USING btree (street_place_id);


--
-- Name: atd_txdot_units_death_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_death_cnt_index ON public.atd_txdot_units USING btree (death_cnt);


--
-- Name: atd_txdot_units_movement_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_movement_id_index ON public.atd_txdot_units USING btree (movement_id);


--
-- Name: atd_txdot_units_sus_serious_injry_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_sus_serious_injry_cnt_index ON public.atd_txdot_units USING btree (sus_serious_injry_cnt);


--
-- Name: atd_txdot_units_temp_death_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_temp_death_cnt_index ON public.atd_txdot_units_temp USING btree (death_cnt);


--
-- Name: atd_txdot_units_temp_movement_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_temp_movement_id_index ON public.atd_txdot_units_temp USING btree (movement_id);


--
-- Name: atd_txdot_units_temp_sus_serious_injry_cnt_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_temp_sus_serious_injry_cnt_index ON public.atd_txdot_units_temp USING btree (sus_serious_injry_cnt);


--
-- Name: atd_txdot_units_temp_unit_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_temp_unit_id_index ON public.atd_txdot_units_temp USING btree (unit_id);


--
-- Name: atd_txdot_units_unit_id_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX atd_txdot_units_unit_id_index ON public.atd_txdot_units USING btree (unit_id);


--
-- Name: hin_corridors_buffered_corridor_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX hin_corridors_buffered_corridor_idx ON public.hin_corridors USING gist (buffered_corridor);


--
-- Name: hin_corridors_corridor_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX hin_corridors_corridor_idx ON public.hin_corridors USING gist (corridor);


--
-- Name: idx_atd_txdot_person_crash_id; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX idx_atd_txdot_person_crash_id ON public.atd_txdot_person USING btree (crash_id);


--
-- Name: idx_atd_txdot_primaryperson_crash_id; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX idx_atd_txdot_primaryperson_crash_id ON public.atd_txdot_primaryperson USING btree (crash_id);


--
-- Name: idx_atd_txdot_units_crash_id; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX idx_atd_txdot_units_crash_id ON public.atd_txdot_units USING btree (crash_id);


--
-- Name: idx_atd_txdot_units_temp_crash_id; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX idx_atd_txdot_units_temp_crash_id ON public.atd_txdot_units_temp USING btree (crash_id);


--
-- Name: mv_aaab_case_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_aaab_case_id_idx ON public.all_atd_apd_blueform USING btree (case_id);


--
-- Name: mv_aaab_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_aaab_date_idx ON public.all_atd_apd_blueform USING btree (date);


--
-- Name: mv_aaab_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_aaab_geometry_idx ON public.all_atd_apd_blueform USING gist ("position");


--
-- Name: mv_aatc_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_aatc_crash_id_idx ON public.all_atd_txdot_crashes USING btree (crash_id);


--
-- Name: mv_aatc_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_aatc_date_idx ON public.all_atd_txdot_crashes USING btree (crash_date);


--
-- Name: mv_aatc_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_aatc_deaths_idx ON public.all_atd_txdot_crashes USING btree (death_cnt);


--
-- Name: mv_aatc_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_aatc_geometry_idx ON public.all_atd_txdot_crashes USING gist ("position");


--
-- Name: mv_accom_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_accom_crash_id_idx ON public.all_cr3_crashes_off_mainlane USING btree (crash_id);


--
-- Name: mv_accom_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_accom_date_idx ON public.all_cr3_crashes_off_mainlane USING btree (crash_date);


--
-- Name: mv_accom_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_accom_deaths_idx ON public.all_cr3_crashes_off_mainlane USING btree (death_cnt);


--
-- Name: mv_accom_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_accom_geometry_idx ON public.all_cr3_crashes_off_mainlane USING gist ("position");


--
-- Name: mv_acom_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_acom_crash_id_idx ON public.all_crashes_off_mainlane USING btree (crash_id);


--
-- Name: mv_acom_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_acom_date_idx ON public.all_crashes_off_mainlane USING btree (date);


--
-- Name: mv_acom_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_acom_deaths_idx ON public.all_crashes_off_mainlane USING btree (death_cnt);


--
-- Name: mv_acom_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_acom_geometry_idx ON public.all_crashes_off_mainlane USING gist (geometry);


--
-- Name: mv_anccom_case_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_anccom_case_id_idx ON public.all_non_cr3_crashes_off_mainlane USING btree (case_id);


--
-- Name: mv_anccom_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_anccom_date_idx ON public.all_non_cr3_crashes_off_mainlane USING btree (date);


--
-- Name: mv_anccom_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_anccom_geometry_idx ON public.all_non_cr3_crashes_off_mainlane USING gist ("position");


--
-- Name: mv_fyaab_case_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyaab_case_id_idx ON public.five_year_atd_apd_blueform USING btree (case_id);


--
-- Name: mv_fyaab_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyaab_date_idx ON public.five_year_atd_apd_blueform USING btree (date);


--
-- Name: mv_fyaab_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyaab_geometry_idx ON public.five_year_atd_apd_blueform USING gist ("position");


--
-- Name: mv_fyacoap_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacoap_crash_id_idx ON public.five_year_all_crashes_outside_any_polygons USING btree (crash_id);


--
-- Name: mv_fyacoap_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacoap_date_idx ON public.five_year_all_crashes_outside_any_polygons USING btree (date);


--
-- Name: mv_fyacoap_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacoap_deaths_idx ON public.five_year_all_crashes_outside_any_polygons USING btree (death_cnt);


--
-- Name: mv_fyacoap_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacoap_geometry_idx ON public.five_year_all_crashes_outside_any_polygons USING gist (geometry);


--
-- Name: mv_fyacom_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacom_crash_id_idx ON public.five_year_all_crashes_off_mainlane USING btree (crash_id);


--
-- Name: mv_fyacom_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacom_date_idx ON public.five_year_all_crashes_off_mainlane USING btree (date);


--
-- Name: mv_fyacom_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacom_deaths_idx ON public.five_year_all_crashes_off_mainlane USING btree (death_cnt);


--
-- Name: mv_fyacom_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacom_geometry_idx ON public.five_year_all_crashes_off_mainlane USING gist (geometry);


--
-- Name: mv_fyacomosp_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacomosp_crash_id_idx ON public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING btree (crash_id);


--
-- Name: mv_fyacomosp_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacomosp_date_idx ON public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING btree (date);


--
-- Name: mv_fyacomosp_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacomosp_deaths_idx ON public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING btree (death_cnt);


--
-- Name: mv_fyacomosp_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacomosp_geometry_idx ON public.five_year_all_crashes_off_mainlane_outside_surface_polygons USING gist (geometry);


--
-- Name: mv_fyacosp_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacosp_crash_id_idx ON public.five_year_all_crashes_outside_surface_polygons USING btree (crash_id);


--
-- Name: mv_fyacosp_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacosp_date_idx ON public.five_year_all_crashes_outside_surface_polygons USING btree (date);


--
-- Name: mv_fyacosp_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacosp_deaths_idx ON public.five_year_all_crashes_outside_surface_polygons USING btree (death_cnt);


--
-- Name: mv_fyacosp_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyacosp_geometry_idx ON public.five_year_all_crashes_outside_surface_polygons USING gist (geometry);


--
-- Name: mv_fyatc_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyatc_crash_id_idx ON public.five_year_atd_txdot_crashes USING btree (crash_id);


--
-- Name: mv_fyatc_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyatc_date_idx ON public.five_year_atd_txdot_crashes USING btree (crash_date);


--
-- Name: mv_fyatc_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyatc_deaths_idx ON public.five_year_atd_txdot_crashes USING btree (death_cnt);


--
-- Name: mv_fyatc_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyatc_geometry_idx ON public.five_year_atd_txdot_crashes USING gist ("position");


--
-- Name: mv_fyccom_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccom_crash_id_idx ON public.five_year_cr3_crashes_off_mainlane USING btree (crash_id);


--
-- Name: mv_fyccom_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccom_date_idx ON public.five_year_cr3_crashes_off_mainlane USING btree (crash_date);


--
-- Name: mv_fyccom_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccom_deaths_idx ON public.five_year_cr3_crashes_off_mainlane USING btree (death_cnt);


--
-- Name: mv_fyccom_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccom_geometry_idx ON public.five_year_cr3_crashes_off_mainlane USING gist ("position");


--
-- Name: mv_fyccosp_crash_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccosp_crash_id_idx ON public.five_year_cr3_crashes_outside_surface_polygons USING btree (crash_id);


--
-- Name: mv_fyccosp_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccosp_date_idx ON public.five_year_cr3_crashes_outside_surface_polygons USING btree (crash_date);


--
-- Name: mv_fyccosp_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccosp_deaths_idx ON public.five_year_cr3_crashes_outside_surface_polygons USING btree (death_cnt);


--
-- Name: mv_fyccosp_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyccosp_geometry_idx ON public.five_year_cr3_crashes_outside_surface_polygons USING gist ("position");


--
-- Name: mv_fyhpwcd_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyhpwcd_deaths_idx ON public.five_year_highway_polygons_with_crash_data USING btree (total_death_cnt);


--
-- Name: mv_fyhpwcd_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyhpwcd_geometry_idx ON public.five_year_highway_polygons_with_crash_data USING gist (geometry);


--
-- Name: mv_fyhpwcd_location_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyhpwcd_location_id_idx ON public.five_year_highway_polygons_with_crash_data USING btree (location_id);


--
-- Name: mv_fynccom_case_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fynccom_case_id_idx ON public.five_year_non_cr3_crashes_off_mainlane USING btree (case_id);


--
-- Name: mv_fynccom_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fynccom_date_idx ON public.five_year_non_cr3_crashes_off_mainlane USING btree (date);


--
-- Name: mv_fynccom_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fynccom_geometry_idx ON public.five_year_non_cr3_crashes_off_mainlane USING gist ("position");


--
-- Name: mv_fynccosp_case_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fynccosp_case_id_idx ON public.five_year_non_cr3_crashes_outside_surface_polygons USING btree (case_id);


--
-- Name: mv_fynccosp_date_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fynccosp_date_idx ON public.five_year_non_cr3_crashes_outside_surface_polygons USING btree (date);


--
-- Name: mv_fynccosp_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fynccosp_geometry_idx ON public.five_year_non_cr3_crashes_outside_surface_polygons USING gist ("position");


--
-- Name: mv_fyspwcd_deaths_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyspwcd_deaths_idx ON public.five_year_surface_polygons_with_crash_data USING btree (total_death_cnt);


--
-- Name: mv_fyspwcd_geometry_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyspwcd_geometry_idx ON public.five_year_surface_polygons_with_crash_data USING gist (geometry);


--
-- Name: mv_fyspwcd_location_id_idx; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX mv_fyspwcd_location_id_idx ON public.five_year_surface_polygons_with_crash_data USING btree (location_id);


--
-- Name: polygons_geometry_index; Type: INDEX; Schema: public; Owner: atd_vz_data
--

CREATE INDEX polygons_geometry_index ON public.polygons USING gist (geometry);


--
-- Name: view_location_crashes_global _RETURN; Type: RULE; Schema: public; Owner: atd_vz_data
--

CREATE OR REPLACE VIEW public.view_location_crashes_global AS
 SELECT atc.crash_id,
    'CR3'::text AS type,
    atc.location_id,
    atc.case_id,
    atc.crash_date,
    atc.crash_time,
    atc.day_of_week,
    atc.crash_sev_id,
    atc.longitude_primary,
    atc.latitude_primary,
    atc.address_confirmed_primary,
    atc.address_confirmed_secondary,
    atc.non_injry_cnt,
    atc.nonincap_injry_cnt,
    atc.poss_injry_cnt,
    atc.sus_serious_injry_cnt,
    atc.tot_injry_cnt,
    atc.death_cnt,
    atc.unkn_injry_cnt,
    atc.est_comp_cost_crash_based AS est_comp_cost,
    string_agg((atcl.collsn_desc)::text, ','::text) AS collsn_desc,
    string_agg((attdl.trvl_dir_desc)::text, ','::text) AS travel_direction,
    string_agg((atml.movement_desc)::text, ','::text) AS movement_desc,
    string_agg((atvbsl.veh_body_styl_desc)::text, ','::text) AS veh_body_styl_desc,
    string_agg(atvudl.veh_unit_desc_desc, ','::text) AS veh_unit_desc_desc
   FROM ((((((public.atd_txdot_crashes atc
     LEFT JOIN public.atd_txdot__collsn_lkp atcl ON ((atc.fhe_collsn_id = atcl.collsn_id)))
     LEFT JOIN public.atd_txdot_units atu ON ((atc.crash_id = atu.crash_id)))
     LEFT JOIN public.atd_txdot__trvl_dir_lkp attdl ON ((atu.travel_direction = attdl.trvl_dir_id)))
     LEFT JOIN public.atd_txdot__movt_lkp atml ON ((atu.movement_id = atml.movement_id)))
     LEFT JOIN public.atd_txdot__veh_body_styl_lkp atvbsl ON ((atu.veh_body_styl_id = atvbsl.veh_body_styl_id)))
     LEFT JOIN public.atd_txdot__veh_unit_desc_lkp atvudl ON ((atu.unit_desc_id = atvudl.veh_unit_desc_id)))
  WHERE (atc.crash_date >= ((now() - '5 years'::interval))::date)
  GROUP BY atc.crash_id, atc.location_id, atc.case_id, atc.crash_date, atc.crash_time, atc.day_of_week, atc.crash_sev_id, atc.longitude_primary, atc.latitude_primary, atc.address_confirmed_primary, atc.address_confirmed_secondary, atc.non_injry_cnt, atc.nonincap_injry_cnt, atc.poss_injry_cnt, atc.sus_serious_injry_cnt, atc.tot_injry_cnt, atc.death_cnt, atc.unkn_injry_cnt, atc.est_comp_cost
UNION ALL
 SELECT aab.form_id AS crash_id,
    'NON-CR3'::text AS type,
    aab.location_id,
    (aab.case_id)::text AS case_id,
    aab.date AS crash_date,
    (concat(aab.hour, ':00:00'))::time without time zone AS crash_time,
    ( SELECT
                CASE date_part('dow'::text, aab.date)
                    WHEN 0 THEN 'SUN'::text
                    WHEN 1 THEN 'MON'::text
                    WHEN 2 THEN 'TUE'::text
                    WHEN 3 THEN 'WED'::text
                    WHEN 4 THEN 'THU'::text
                    WHEN 5 THEN 'FRI'::text
                    WHEN 6 THEN 'SAT'::text
                    ELSE 'Unknown'::text
                END AS "case") AS day_of_week,
    0 AS crash_sev_id,
    aab.longitude AS longitude_primary,
    aab.latitude AS latitude_primary,
    aab.address AS address_confirmed_primary,
    ''::text AS address_confirmed_secondary,
    0 AS non_injry_cnt,
    0 AS nonincap_injry_cnt,
    0 AS poss_injry_cnt,
    0 AS sus_serious_injry_cnt,
    0 AS tot_injry_cnt,
    0 AS death_cnt,
    0 AS unkn_injry_cnt,
    aab.est_comp_cost_crash_based AS est_comp_cost,
    ''::text AS collsn_desc,
    ''::text AS travel_direction,
    ''::text AS movement_desc,
    ''::text AS veh_body_styl_desc,
    ''::text AS veh_unit_desc_desc
   FROM public.atd_apd_blueform aab
  WHERE (aab.date >= ((now() - '5 years'::interval))::date);


--
-- Name: atd_apd_blueform atd_txdot_blueform_update_position; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_blueform_update_position BEFORE INSERT OR UPDATE ON public.atd_apd_blueform FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_blueform_update_position();


--
-- Name: atd_txdot_charges atd_txdot_charges_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_charges_audit_log BEFORE UPDATE ON public.atd_txdot_charges FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_charges_updates_audit_log();

ALTER TABLE public.atd_txdot_charges DISABLE TRIGGER atd_txdot_charges_audit_log;


--
-- Name: atd_txdot_crashes atd_txdot_crashes_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_crashes_audit_log BEFORE INSERT OR UPDATE ON public.atd_txdot_crashes FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_crashes_updates_audit_log();


--
-- Name: atd_txdot_locations atd_txdot_location_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_location_audit_log BEFORE INSERT OR UPDATE ON public.atd_txdot_locations FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_locations_updates_audit_log();

ALTER TABLE public.atd_txdot_locations DISABLE TRIGGER atd_txdot_location_audit_log;


--
-- Name: atd_txdot_locations atd_txdot_locations_updates_crash_locations; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_locations_updates_crash_locations BEFORE UPDATE ON public.atd_txdot_locations FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_locations_updates_crash_locations();

ALTER TABLE public.atd_txdot_locations DISABLE TRIGGER atd_txdot_locations_updates_crash_locations;


--
-- Name: atd_txdot_person atd_txdot_person_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_person_audit_log BEFORE UPDATE ON public.atd_txdot_person FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_person_updates_audit_log();

ALTER TABLE public.atd_txdot_person DISABLE TRIGGER atd_txdot_person_audit_log;


--
-- Name: atd_txdot_primaryperson atd_txdot_primaryperson_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_primaryperson_audit_log BEFORE UPDATE ON public.atd_txdot_primaryperson FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_primaryperson_updates_audit_log();


--
-- Name: atd_txdot_units atd_txdot_units_audit_log; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_units_audit_log BEFORE UPDATE ON public.atd_txdot_units FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_units_updates_audit_log();


--
-- Name: atd_txdot_units atd_txdot_units_create; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_units_create BEFORE INSERT ON public.atd_txdot_units FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_units_create();


--
-- Name: atd_txdot_units atd_txdot_units_create_update; Type: TRIGGER; Schema: public; Owner: atd_vz_data
--

CREATE TRIGGER atd_txdot_units_create_update BEFORE INSERT OR UPDATE ON public.atd_txdot_units FOR EACH ROW EXECUTE PROCEDURE public.atd_txdot_units_create_update();

--
-- Name: atd_txdot_person atd_txdot_person_prsn_injry_sev_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.atd_txdot_person
    ADD CONSTRAINT atd_txdot_person_prsn_injry_sev_id_fkey FOREIGN KEY (prsn_injry_sev_id) REFERENCES public.atd_txdot__injry_sev_lkp(injry_sev_id) ON UPDATE RESTRICT ON DELETE RESTRICT;

