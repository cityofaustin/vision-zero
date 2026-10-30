CREATE SEQUENCE IF NOT EXISTS afd__incidents_id_seq1;

CREATE TABLE "public"."afd__incidents" (
    "id" int4 NOT NULL DEFAULT nextval('afd__incidents_id_seq1'::regclass),
    "incident_number" int4,
    "crash_id" int4,
    "unparsed_ems_incident_number" text,
    "ems_incident_numbers" _int4,
    "calendar_year" int4,
    "jurisdiction" text,
    "address" text,
    "problem" text,
    "flagged_incs" int4,
    "geometry" geometry DEFAULT NULL::geometry,
    "austin_full_purpose" bool,
    "location_id" text,
    "latitude" float8,
    "longitude" float8,
    "ems_incident_number_1" int4,
    "ems_incident_number_2" int4,
    "call_datetime" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

CREATE OR REPLACE FUNCTION public.afd_incidents_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_location_id text;
BEGIN
    -- Set geometry
    NEW.geometry = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);

    -- Check Austin Full Purpose jurisdiction
    NEW.austin_full_purpose = COALESCE(EXISTS (
        SELECT 1 
        FROM geo.jurisdictions 
        WHERE jurisdiction_label = 'AUSTIN FULL PURPOSE'
        AND ST_Contains(geometry, NEW.geometry)
    ), FALSE);

    -- Extract EMS incident numbers
    NEW.ems_incident_number_1 = (NEW.ems_incident_numbers)[1];
    NEW.ems_incident_number_2 = (NEW.ems_incident_numbers)[2];

    -- Find location_id with group priority (1 first, then 2)
    SELECT location_id INTO v_location_id
    FROM locations
    WHERE location_group = 1 
        AND NEW.geometry && geometry 
        AND ST_Contains(geometry, NEW.geometry)
        AND is_deleted = FALSE
    LIMIT 1;

    -- If no group 1 location found, try group 2
    IF v_location_id IS NULL THEN
        SELECT location_id INTO v_location_id
        FROM locations
        WHERE location_group = 2 
            AND NEW.geometry && geometry 
            AND ST_Contains(geometry, NEW.geometry)
            AND is_deleted = FALSE
        LIMIT 1;
    END IF;

    NEW.location_id = v_location_id;

    RETURN NEW;
END;
$function$;

create trigger afd_incidents_trigger_insert BEFORE INSERT ON afd__incidents FOR EACH ROW EXECUTE FUNCTION afd_incidents_trigger();
create trigger afd_incidents_trigger_update BEFORE UPDATE ON afd__incidents FOR EACH ROW WHEN (old.latitude IS DISTINCT FROM new.latitude OR old.longitude IS DISTINCT FROM new.longitude OR old.ems_incident_numbers IS DISTINCT FROM new.ems_incident_numbers) EXECUTE FUNCTION afd_incidents_trigger();
create trigger set_public_afd__incidents_updated_at BEFORE UPDATE ON afd__incidents FOR EACH ROW EXECUTE FUNCTION set_current_timestamp_updated_at();
