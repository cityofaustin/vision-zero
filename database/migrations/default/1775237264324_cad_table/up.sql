CREATE TABLE cad_incidents (
    id serial PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text DEFAULT 'system'::text NOT NULL,
    updated_by text DEFAULT 'system'::text NOT NULL,
    address text,
    agency_type text,
    call_disposition text,
    final_problem text,
    incident_type text,
    incident_group_id integer,
    initial_problem text,
    master_incident_id integer unique,
    master_incident_number text,
    priority_description text,
    priority_number text,
    response_date timestamp with time zone,
    time_call_closed timestamp with time zone,
    time_first_unit_arrived timestamp with time zone,
    latitude numeric,
    longitude numeric,
    geom geometry(Point, 4326),
    location_id text,
    in_austin_full_purpose boolean
);


CREATE TABLE cad_incident_groups (
    id serial PRIMARY KEY,    
    incident_group_id integer NOT NULL,
    master_incident_id integer NOT NULL,
    UNIQUE (incident_group_id, master_incident_id)
);


ALTER TABLE cad_incidents
    ADD CONSTRAINT cad_incidents_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(location_id) ON UPDATE CASCADE ON DELETE SET NULL;

CREATE TRIGGER set_updated_at_timestamp_cad_incidents 
    BEFORE UPDATE ON public.cad_incidents
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE INDEX idx_cad_incidents_geom ON cad_incidents USING GIST (geom);

CREATE INDEX idx_cad_incidents_response_date ON cad_incidents (response_date);

CREATE INDEX idx_cad_incidents_match_status ON cad_incidents (match_status);

comment on table cad_incidents is 'This dataset contains information on both 911 calls (usually referred to as Calls for Service or Dispatched Incidents) and officer-initiated incidents related to traffic crashes as recorded in the Austin public safety Computer Aided Dispatch (CAD) system. Data is provided by the public safety enterprise data team after approval by AFD, ATCEMS, and APD';

comment on column cad_incidents.address is 'The incident address';

CREATE OR REPLACE FUNCTION cad_incidents_set_spatial_attributes ()
RETURNS trigger AS $$
DECLARE
    v_location_id text;
BEGIN
    --
    -- Create geometry
    --
    NEW.geom := ST_SetSRID(
        ST_MakePoint(NEW.longitude, NEW.latitude),
        4326
    );
    --
    -- Set location_id
    --
    -- Find location_id with group priority (1 first, then 2)
    SELECT location_id INTO v_location_id
    FROM locations
    WHERE location_group = 1 
        AND NEW.geom && geometry 
        AND ST_Contains(geometry, NEW.geom)
        AND is_deleted = FALSE
    LIMIT 1;
    -- If no group 1 location found, try group 2
    IF v_location_id IS NULL THEN
        SELECT location_id INTO v_location_id
        FROM locations
        WHERE location_group = 2 
            AND NEW.geom && geometry 
            AND ST_Contains(geometry, NEW.geom)
            AND is_deleted = FALSE
        LIMIT 1;
    END IF;
    NEW.location_id = v_location_id;
    --
    -- Set in_austin_full_purpose
    --    
    NEW.in_austin_full_purpose = EXISTS (
        SELECT
            1
        FROM
            geo.jurisdictions
        WHERE
            JURISDICTION_LABEL = 'AUSTIN FULL PURPOSE'
            AND ST_Intersects (geometry, NEW.geom)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_cad_incidents_set_spatial_attributes
    BEFORE INSERT OR UPDATE OF latitude, longitude ON cad_incidents
    FOR EACH ROW EXECUTE FUNCTION cad_incidents_set_spatial_attributes();

