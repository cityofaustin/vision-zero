CREATE SEQUENCE IF NOT EXISTS afd__incidents_id_seq;

-- Table Definition
CREATE TABLE "public"."afd__incidents" (
    "incident_number" text,
    "ems_incident_number" text,
    "calendar_year" text,
    "jurisdiction" text,
    "address" text,
    "problem" text,
    "flagged_incs" text,
    "geometry" geometry(Point,4326),
    "call_datetime" timestamp,
    "id" int4 NOT NULL DEFAULT nextval('afd__incidents_id_seq'::regclass),
    "austin_full_purpose" bool,
    "location_id" varchar,
    "latitude" float8,
    "longitude" float8,
    CONSTRAINT "afd__incidents_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."atd_txdot_locations"("location_id"),
    PRIMARY KEY ("id")
);

