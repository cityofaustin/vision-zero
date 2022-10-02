DROP TABLE public.ems__incidents;

CREATE TABLE public.ems__incidents (
	id serial primary key,
	pcr_key int4 NOT NULL,
	crash_id integer default null,
	incident_date_received date NULL,
	incident_time_received time NULL,
	incident_number text NULL,
	incident_location_address text NULL,
	incident_location_city text NULL,
	incident_location_state text NULL,
	incident_location_zip text NULL,
	incident_location_longitude float NULL,
	incident_location_latitude float NULL,
	incident_problem text NULL,
	incident_priority_number text NULL,
	pcr_cause_of_injury text NULL,
	pcr_patient_complaints text NULL,
	pcr_provider_impression_primary text NULL,
	pcr_provider_impression_secondary text NULL,
	pcr_outcome text NULL,
	pcr_transport_destination text NULL,
	pcr_patient_acuity_level text NULL,
	pcr_patient_acuity_level_reason text NULL,
	pcr_patient_age integer NULL,
	pcr_patient_gender text NULL,
	pcr_patient_race text NULL,
	mvc_form_airbag_deployment text NULL,
	mvc_form_airbag_deployment_status text NULL,
	mvc_form_collision_indicators text NULL,
	mvc_form_damage_location text NULL,
	mvc_form_estimated_speed_kph integer NULL,
	mvc_form_estimated_speed_mph integer NULL,
	mvc_form_extrication_comments text NULL,
	mvc_form_extrication_datetime timestamp NULL,
	mvc_form_extrication_required_flag integer NULL,
	mvc_form_patient_injured_flag integer NULL,
	mvc_form_position_in_vehicle text NULL,
	mvc_form_safety_devices text NULL,
	mvc_form_seat_row_number text NULL,
	mvc_form_vehicle_type text NULL,
	mvc_form_weather text NULL,
	pcr_additional_agencies text NULL,
	pcr_transport_priority text NULL,
	pcr_patient_acuity_initial text NULL,
	pcr_patient_acuity_final text NULL,
	unparsed_apd_incident_numbers text NULL,
	apd_incident_numbers integer[] NULL,
	geometry public.geometry(point, 4326) NULL,
    austin_full_purpose bool default null,
    location_id text default null,
    latitude float8 default null,
    longitude float8 default null,
    apd_incident_number_1 integer default null,
    apd_incident_number_2 integer default null,
    mvc_form_date date default null,
    mvc_form_time time default null
);



CREATE OR REPLACE FUNCTION ems_incidents_trigger()
  RETURNS trigger AS
$$
BEGIN
  update ems__incidents set
    austin_full_purpose = (
      select ST_Contains(jurisdiction.geometry, incidents.geometry)
      from ems__incidents incidents
      left join atd_jurisdictions jurisdiction on (jurisdiction.jurisdiction_label = 'AUSTIN FULL PURPOSE')
      where incidents.id = new.id),
    location_id = (
      select locations.location_id
      from ems__incidents incidents
      join atd_txdot_locations locations on (incidents.geometry && locations.shape and ST_Contains(locations.shape, incidents.geometry))
      where incidents.id = new.id),
    latitude = ST_Y(ems__incidents.geometry),
    longitude = ST_X(ems__incidents.geometry),
    apd_incident_number_1 = ems__incidents.apd_incident_numbers[1],
    apd_incident_number_2 = ems__incidents.apd_incident_numbers[2],
    mvc_form_date = date(ems__incidents.mvc_form_extrication_datetime),
    mvc_form_time = ems__incidents.mvc_form_extrication_datetime::time
    where ems__incidents.id = new.id;
RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';

create trigger ems_incidents_trigger_insert
after insert on public.ems__incidents
for each row execute procedure ems_incidents_trigger();

create trigger ems_incidents_trigger_update
after update on public.ems__incidents
for each row 
WHEN (false 
  or old.geometry IS DISTINCT FROM new.geometry
  or old.apd_incident_numbers is distinct from new.apd_incident_numbers
  or old.mvc_form_extrication_datetime is distinct from new.mvc_form_extrication_datetime)
execute procedure ems_incidents_trigger();



-- Column Comment
COMMENT ON COLUMN "public"."ems__incidents"."pcr_key" IS 'Unique identifier for the patient care record in the EMS Data Warehouse. Can be used to uniquely identify records in this dataset';
COMMENT ON COLUMN "public"."ems__incidents"."incident_date_received" IS 'The date that the incident was received by EMS. This could be the date that the EMS call taker took the call, or when it was transferred to EMS from another agency';
COMMENT ON COLUMN "public"."ems__incidents"."incident_time_received" IS 'The time that the incident was received by EMS. This could be the time that the EMS call taker took the call, or when it was transferred to EMS from another agency';
COMMENT ON COLUMN "public"."ems__incidents"."incident_number" IS 'Unique identifier for the Incident. Note that this value may not be unique to records in this dataset, as there may be multiple patient care records for a single incident';
COMMENT ON COLUMN "public"."ems__incidents"."incident_location_address" IS 'The street address for the location of the incident';
COMMENT ON COLUMN "public"."ems__incidents"."incident_location_city" IS 'The city in which the incident occurred';
COMMENT ON COLUMN "public"."ems__incidents"."incident_location_state" IS 'The state in which the incident occurred';
COMMENT ON COLUMN "public"."ems__incidents"."incident_location_zip" IS 'The zip code in which the incident occurred';
COMMENT ON COLUMN "public"."ems__incidents"."incident_location_longitude" IS 'The longitude coordinate for the location of the incident';
COMMENT ON COLUMN "public"."ems__incidents"."incident_location_latitude" IS 'The latitude coordinate for the location of the incident';
COMMENT ON COLUMN "public"."ems__incidents"."incident_problem" IS 'The ''call type'' or reason for the incident. Determined by communications staff while processing the 911 call.';
COMMENT ON COLUMN "public"."ems__incidents"."incident_priority_number" IS 'The ''priority'' of the incident. Determined by communications staff while processing the incident. Priority 1 is the highest priority, while 5 is the lowest priority';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_cause_of_injury" IS 'A general description of the what caused the patient''s injury if applicable';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_patient_complaints" IS 'A general description of what the patient is complaining of (ex chest pain, difficulty breathing, etc)';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_provider_impression_primary" IS 'The provider''s primary impression of the patient''s condition/injury/illness based on their assessment of the patient';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_provider_impression_secondary" IS 'The provider''s secondary or supporting impression of the patient''s condition/injury/illness based on their assessment of the patient';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_outcome" IS 'A general description of the outcome of the patient encounter (ex Transported, Refused, Deceased)';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_transport_destination" IS 'The facility that the patient was transported to, if applicable';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_patient_acuity_level_reason" IS 'Indicates the primary reason a patient is determined to be ''High'' acuity, if applicable';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_patient_age" IS 'The patient''s age at the time of the encounter';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_patient_gender" IS 'The patient''s gender';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_patient_race" IS 'The patient''s race';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_airbag_deployment" IS 'Indicates which airbags were deployed (front, side, etc)';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_airbag_deployment_status" IS 'Indicates whether airbags were deployed';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_collision_indicators" IS '? ';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_damage_location" IS 'Location of damage to the vehicle';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_estimated_speed_kph" IS 'Estimated speed of the vehicle in kilometers per hour';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_estimated_speed_mph" IS 'Estimated speed of the vehicle in miles per hour';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_extrication_comments" IS 'Provider notes about any extrication that was performed';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_extrication_datetime" IS 'The time that an extrication was performed';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_extrication_required_flag" IS 'Indicates whether the patient needed to be extricated from the vehicle (1 = yes, 0 = no)';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_patient_injured_flag" IS 'Indicates whether the patient was injured ( 1 = yes, 0 = no)';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_position_in_vehicle" IS 'Where the patient was in the vehicle (front seat, second seat, etc)';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_safety_devices" IS 'A list of any safety devices used, such as seatbelts or car seats';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_seat_row_number" IS '?';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_vehicle_type" IS 'The type of vehicle involved in the accident (automobile, motorcycle, etc)';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_weather" IS 'A general description of weather conditions at the time of the accident';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_additional_agencies" IS 'A comma delimitted list of agencies that responded to this incident in addtion to EMS';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_transport_priority" IS 'Code 1 is lower priority transport without lights and sirens. Code 3 is a higher priority transport with lights and sirens';
COMMENT ON COLUMN "public"."ems__incidents"."apd_incident_numbers" IS 'A comma delimitted list of incident numbers for APD incidents that are linked to the EMS incident. This field can be used to determin if there is an associated APD incident.';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_patient_acuity_initial" IS 'Initial patient acuity determined by provider';
COMMENT ON COLUMN "public"."ems__incidents"."pcr_patient_acuity_final" IS 'Final patient acuity determined by provider';
