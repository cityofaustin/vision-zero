CREATE TABLE vz_incidents (
    id bigserial PRIMARY KEY,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_deleted boolean NOT NULL DEFAULT FALSE
);

CREATE TRIGGER set_updated_at_timestamp_vz_incidents BEFORE
UPDATE ON public.vz_incidents FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp ();

COMMENT ON TABLE public.vz_incidents is 'Table which stores Vision Zero-defined incidents, which function to group various types of crash-related records (crash reports, CAD, EMS, AFD) under a single entity.';

ALTER TABLE cad_incidents
ADD COLUMN is_cancelled_call boolean GENERATED ALWAYS AS (
  coalesce(
        lower(call_disposition) LIKE '%cancelled%'
        or lower(call_disposition) LIKE '%canceled%'
        OR lower(call_disposition) LIKE '%false alarm%'
        OR lower(call_disposition) LIKE '%duplicate%'
        OR lower(call_disposition) LIKE '%reassigned call%'
        OR lower(call_disposition) LIKE '%test call%'
        OR lower(call_disposition) like '%training%'
    false)
) STORED,
ADD COLUMN vz_incident_id bigint REFERENCES vz_incidents(id);

COMMENT ON COLUMN public.cad_incidents.is_cancelled_call is 'If the call disposition indicated that the call was canceled, a duplicate, false alarm, etc.';
COMMENT ON COLUMN public.cad_incidents.vz_incident_id is 'The vz_incidents foreign key. When null, indicates that this incident has not been processed by the VZ incident grouping ETL.';

-- todo: needed?
CREATE INDEX cad_incidents_geom_geography_idx 
    ON cad_incidents USING GIST ((geom::geography));

CREATE INDEX idx_cad_incidents_vz_incident_id ON cad_incidents(vz_incident_id);
