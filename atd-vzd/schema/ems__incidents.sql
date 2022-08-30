CREATE TABLE "public"."ems__incidents" (
    "pcr_key" int4 NOT NULL,
    "incident_date_received" date,
    "incident_time_received" time,
    "incident_number" varchar(255),
    "incident_location_address" varchar(400),
    "incident_location_city" varchar(35),
    "incident_location_state" varchar(30),
    "incident_location_zip" varchar(30),
    "incident_location_longitude" numeric,
    "incident_location_latitude" numeric,
    "incident_problem" varchar(255),
    "incident_priority_number" varchar(10),
    "pcr_cause_of_injury" varchar,
    "pcr_patient_complaints" varchar,
    "pcr_provider_impression_primary" varchar(255),
    "pcr_provider_impression_secondary" varchar(255),
    "pcr_outcome" varchar(30),
    "pcr_transport_destination" varchar(255),
    "pcr_patient_acuity_level" varchar(255),
    "pcr_patient_acuity_level_reason" varchar(255),
    "pcr_patient_age" int4,
    "pcr_patient_gender" varchar(30),
    "pcr_patient_race" varchar(255),
    "mvc_form_airbag_deployment" varchar(255),
    "mvc_form_airbag_deployment_status" varchar(60),
    "mvc_form_collision_indicators" varchar(255),
    "mvc_form_damage_location" varchar(255),
    "mvc_form_estimated_speed_kph" int4,
    "mvc_form_estimated_speed_mph" int4,
    "mvc_form_extrication_comments" varchar(255),
    "mvc_form_extrication_time" timestamp,
    "mvc_form_extrication_required_flag" int4,
    "mvc_form_patient_injured_flag" int4,
    "mvc_form_position_in_vehicle" varchar(255),
    "mvc_form_safety_devices" varchar(255),
    "mvc_form_seat_row_number" varchar(10),
    "mvc_form_vehicle_type" varchar(60),
    "mvc_form_weather" varchar(60),
    "pcr_additional_agencies" varchar(100),
    "pcr_transport_priority" varchar(255),
    "apd_incident_numbers" varchar(255),
    "pcr_patient_acuity_initial" varchar(60),
    "pcr_patient_acuity_final" varchar(60),
    "geometry" geometry,
    "austin_full_purpose" bool,
    "location_id" varchar,
    "apd_incident_number_1" varchar(255),
    "apd_incident_number_2" varchar(255),
    "mvc_form_time" time,
    "mvc_form_date" date,
    CONSTRAINT "ems__incidents_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."atd_txdot_locations"("location_id"),
    PRIMARY KEY ("pcr_key")
);

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
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_extrication_time" IS 'The time that an extrication was performed';
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
COMMENT ON COLUMN "public"."ems__incidents"."geometry" IS 'ATD created x, y point value ';
COMMENT ON COLUMN "public"."ems__incidents"."apd_incident_number_1" IS 'A comma delimitted list of incident numbers for APD incidents that are linked to the EMS incident. This field can be used to determin if there is an associated APD incident.';
COMMENT ON COLUMN "public"."ems__incidents"."apd_incident_number_2" IS 'A comma delimitted list of incident numbers for APD incidents that are linked to the EMS incident. This field can be used to determin if there is an associated APD incident.';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_time" IS 'The time that an extrication was performed';
COMMENT ON COLUMN "public"."ems__incidents"."mvc_form_date" IS 'The date that an extrication was performed';

