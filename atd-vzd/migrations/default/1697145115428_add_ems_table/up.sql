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
-- Name: ems__incidents; Type: TABLE; Schema: public; Owner: vze
--

CREATE TABLE public.ems__incidents (
    id integer NOT NULL,
    pcr_key integer NOT NULL,
    crash_id integer,
    incident_date_received date,
    incident_time_received time without time zone,
    incident_number text,
    incident_location_address text,
    incident_location_city text,
    incident_location_state text,
    incident_location_zip text,
    incident_location_longitude double precision,
    incident_location_latitude double precision,
    incident_problem text,
    incident_priority_number text,
    pcr_cause_of_injury text,
    pcr_patient_complaints text,
    pcr_provider_impression_primary text,
    pcr_provider_impression_secondary text,
    pcr_outcome text,
    pcr_transport_destination text,
    pcr_patient_acuity_level text,
    pcr_patient_acuity_level_reason text,
    pcr_patient_age integer,
    pcr_patient_gender text,
    pcr_patient_race text,
    mvc_form_airbag_deployment text,
    mvc_form_airbag_deployment_status text,
    mvc_form_collision_indicators text,
    mvc_form_damage_location text,
    mvc_form_estimated_speed_kph integer,
    mvc_form_estimated_speed_mph integer,
    mvc_form_extrication_comments text,
    mvc_form_extrication_datetime timestamp without time zone,
    mvc_form_extrication_required_flag integer,
    mvc_form_patient_injured_flag integer,
    mvc_form_position_in_vehicle text,
    mvc_form_safety_devices text,
    mvc_form_seat_row_number text,
    mvc_form_vehicle_type text,
    mvc_form_weather text,
    pcr_additional_agencies text,
    pcr_transport_priority text,
    pcr_patient_acuity_initial text,
    pcr_patient_acuity_final text,
    unparsed_apd_incident_numbers text,
    apd_incident_numbers integer[],
    geometry public.geometry(Point,4326),
    austin_full_purpose boolean,
    location_id text,
    latitude double precision,
    longitude double precision,
    apd_incident_number_1 integer,
    apd_incident_number_2 integer,
    mvc_form_date date,
    mvc_form_time time without time zone
);


-- ALTER TABLE public.ems__incidents OWNER TO vze;

--
-- Name: COLUMN ems__incidents.pcr_key; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_key IS 'Unique identifier for the patient care record in the EMS Data Warehouse. Can be used to uniquely identify records in this dataset';


--
-- Name: COLUMN ems__incidents.incident_date_received; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_date_received IS 'The date that the incident was received by EMS. This could be the date that the EMS call taker took the call, or when it was transferred to EMS from another agency';


--
-- Name: COLUMN ems__incidents.incident_time_received; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_time_received IS 'The time that the incident was received by EMS. This could be the time that the EMS call taker took the call, or when it was transferred to EMS from another agency';


--
-- Name: COLUMN ems__incidents.incident_number; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_number IS 'Unique identifier for the Incident. Note that this value may not be unique to records in this dataset, as there may be multiple patient care records for a single incident';


--
-- Name: COLUMN ems__incidents.incident_location_address; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_location_address IS 'The street address for the location of the incident';


--
-- Name: COLUMN ems__incidents.incident_location_city; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_location_city IS 'The city in which the incident occurred';


--
-- Name: COLUMN ems__incidents.incident_location_state; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_location_state IS 'The state in which the incident occurred';


--
-- Name: COLUMN ems__incidents.incident_location_zip; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_location_zip IS 'The zip code in which the incident occurred';


--
-- Name: COLUMN ems__incidents.incident_location_longitude; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_location_longitude IS 'The longitude coordinate for the location of the incident';


--
-- Name: COLUMN ems__incidents.incident_location_latitude; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_location_latitude IS 'The latitude coordinate for the location of the incident';


--
-- Name: COLUMN ems__incidents.incident_problem; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_problem IS 'The ''call type'' or reason for the incident. Determined by communications staff while processing the 911 call.';


--
-- Name: COLUMN ems__incidents.incident_priority_number; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.incident_priority_number IS 'The ''priority'' of the incident. Determined by communications staff while processing the incident. Priority 1 is the highest priority, while 5 is the lowest priority';


--
-- Name: COLUMN ems__incidents.pcr_cause_of_injury; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_cause_of_injury IS 'A general description of the what caused the patient''s injury if applicable';


--
-- Name: COLUMN ems__incidents.pcr_patient_complaints; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_patient_complaints IS 'A general description of what the patient is complaining of (ex chest pain, difficulty breathing, etc)';


--
-- Name: COLUMN ems__incidents.pcr_provider_impression_primary; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_provider_impression_primary IS 'The provider''s primary impression of the patient''s condition/injury/illness based on their assessment of the patient';


--
-- Name: COLUMN ems__incidents.pcr_provider_impression_secondary; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_provider_impression_secondary IS 'The provider''s secondary or supporting impression of the patient''s condition/injury/illness based on their assessment of the patient';


--
-- Name: COLUMN ems__incidents.pcr_outcome; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_outcome IS 'A general description of the outcome of the patient encounter (ex Transported, Refused, Deceased)';


--
-- Name: COLUMN ems__incidents.pcr_transport_destination; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_transport_destination IS 'The facility that the patient was transported to, if applicable';


--
-- Name: COLUMN ems__incidents.pcr_patient_acuity_level_reason; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_patient_acuity_level_reason IS 'Indicates the primary reason a patient is determined to be ''High'' acuity, if applicable';


--
-- Name: COLUMN ems__incidents.pcr_patient_age; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_patient_age IS 'The patient''s age at the time of the encounter';


--
-- Name: COLUMN ems__incidents.pcr_patient_gender; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_patient_gender IS 'The patient''s gender';


--
-- Name: COLUMN ems__incidents.pcr_patient_race; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_patient_race IS 'The patient''s race';


--
-- Name: COLUMN ems__incidents.mvc_form_airbag_deployment; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_airbag_deployment IS 'Indicates which airbags were deployed (front, side, etc)';


--
-- Name: COLUMN ems__incidents.mvc_form_airbag_deployment_status; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_airbag_deployment_status IS 'Indicates whether airbags were deployed';


--
-- Name: COLUMN ems__incidents.mvc_form_collision_indicators; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_collision_indicators IS '? ';


--
-- Name: COLUMN ems__incidents.mvc_form_damage_location; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_damage_location IS 'Location of damage to the vehicle';


--
-- Name: COLUMN ems__incidents.mvc_form_estimated_speed_kph; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_estimated_speed_kph IS 'Estimated speed of the vehicle in kilometers per hour';


--
-- Name: COLUMN ems__incidents.mvc_form_estimated_speed_mph; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_estimated_speed_mph IS 'Estimated speed of the vehicle in miles per hour';


--
-- Name: COLUMN ems__incidents.mvc_form_extrication_comments; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_extrication_comments IS 'Provider notes about any extrication that was performed';


--
-- Name: COLUMN ems__incidents.mvc_form_extrication_datetime; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_extrication_datetime IS 'The time that an extrication was performed';


--
-- Name: COLUMN ems__incidents.mvc_form_extrication_required_flag; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_extrication_required_flag IS 'Indicates whether the patient needed to be extricated from the vehicle (1 = yes, 0 = no)';


--
-- Name: COLUMN ems__incidents.mvc_form_patient_injured_flag; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_patient_injured_flag IS 'Indicates whether the patient was injured ( 1 = yes, 0 = no)';


--
-- Name: COLUMN ems__incidents.mvc_form_position_in_vehicle; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_position_in_vehicle IS 'Where the patient was in the vehicle (front seat, second seat, etc)';


--
-- Name: COLUMN ems__incidents.mvc_form_safety_devices; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_safety_devices IS 'A list of any safety devices used, such as seatbelts or car seats';


--
-- Name: COLUMN ems__incidents.mvc_form_seat_row_number; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_seat_row_number IS '?';


--
-- Name: COLUMN ems__incidents.mvc_form_vehicle_type; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_vehicle_type IS 'The type of vehicle involved in the accident (automobile, motorcycle, etc)';


--
-- Name: COLUMN ems__incidents.mvc_form_weather; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.mvc_form_weather IS 'A general description of weather conditions at the time of the accident';


--
-- Name: COLUMN ems__incidents.pcr_additional_agencies; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_additional_agencies IS 'A comma delimitted list of agencies that responded to this incident in addtion to EMS';


--
-- Name: COLUMN ems__incidents.pcr_transport_priority; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_transport_priority IS 'Code 1 is lower priority transport without lights and sirens. Code 3 is a higher priority transport with lights and sirens';


--
-- Name: COLUMN ems__incidents.pcr_patient_acuity_initial; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_patient_acuity_initial IS 'Initial patient acuity determined by provider';


--
-- Name: COLUMN ems__incidents.pcr_patient_acuity_final; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.pcr_patient_acuity_final IS 'Final patient acuity determined by provider';


--
-- Name: COLUMN ems__incidents.apd_incident_numbers; Type: COMMENT; Schema: public; Owner: vze
--

COMMENT ON COLUMN public.ems__incidents.apd_incident_numbers IS 'A comma delimitted list of incident numbers for APD incidents that are linked to the EMS incident. This field can be used to determin if there is an associated APD incident.';


--
-- Name: ems__incidents_id_seq; Type: SEQUENCE; Schema: public; Owner: vze
--

CREATE SEQUENCE public.ems__incidents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- ALTER TABLE public.ems__incidents_id_seq OWNER TO vze;

--
-- Name: ems__incidents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vze
--

ALTER SEQUENCE public.ems__incidents_id_seq OWNED BY public.ems__incidents.id;


--
-- Name: ems__incidents id; Type: DEFAULT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.ems__incidents ALTER COLUMN id SET DEFAULT nextval('public.ems__incidents_id_seq'::regclass);


--
-- Name: ems__incidents ems__incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: vze
--

ALTER TABLE ONLY public.ems__incidents
    ADD CONSTRAINT ems__incidents_pkey PRIMARY KEY (id);


--
-- Name: ems__incidents ems_incidents_trigger_insert; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER ems_incidents_trigger_insert AFTER INSERT ON public.ems__incidents FOR EACH ROW EXECUTE FUNCTION public.ems_incidents_trigger();


--
-- Name: ems__incidents ems_incidents_trigger_update; Type: TRIGGER; Schema: public; Owner: vze
--

CREATE TRIGGER ems_incidents_trigger_update AFTER UPDATE ON public.ems__incidents FOR EACH ROW WHEN ((false OR (old.geometry IS DISTINCT FROM new.geometry) OR (old.apd_incident_numbers IS DISTINCT FROM new.apd_incident_numbers) OR (old.mvc_form_extrication_datetime IS DISTINCT FROM new.mvc_form_extrication_datetime))) EXECUTE FUNCTION public.ems_incidents_trigger();
