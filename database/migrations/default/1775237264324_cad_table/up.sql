CREATE TABLE cad_incidents (
    id serial PRIMARY KEY,
    address text,
    agency_type text,
    call_disposition text,
    final_problem text,
    incident_type text,
    initial_problem text,
    master_incident_id text,
    master_incident_number text,
    priority_description text,
    priority_number text,
    response_date timestamp with time zone,
    time_call_closed timestamp with time zone,
    time_first_unit_arrived timestamp with time zone,
    latitude numeric,
    longitude numeric,
    geom geometry(Point, 4326),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text DEFAULT 'system'::text NOT NULL,
    updated_by text DEFAULT 'system'::text NOT NULL
);

comment on table cad_incidents is 'This dataset contains information on both 911 calls (usually referred to as Calls for Service or Dispatched Incidents) and officer-initiated incidents related to traffic crashes as recorded in the Austin public safety Computer Aided Dispatch (CAD) system. Data is provided by the public safety enterprise data team after approval by AFD, ATCEMS, and APD';

comment on column cad_incidents.address is 'The incident address';


CREATE OR REPLACE FUNCTION cad_incidents_set_spatial_attributes()
RETURNS trigger AS $$
BEGIN
    NEW.geom := ST_SetSRID(
        ST_MakePoint(NEW.longitude, NEW.latitude),
        4326
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_cad_incidents_set_spatial_attributes
BEFORE INSERT OR UPDATE OF latitude, longitude
ON cad_incidents
FOR EACH ROW
EXECUTE FUNCTION cad_incidents_set_spatial_attributes();
