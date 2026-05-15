CREATE TABLE vz_incidents (
    id bigserial PRIMARY KEY,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_deleted boolean NOT NULL DEFAULT FALSE
);

CREATE TRIGGER set_updated_at_timestamp_vz_incidents BEFORE
UPDATE ON public.vz_incidents FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp ();

ALTER TABLE cad_incidents
ADD COLUMN vz_incident_id bigint REFERENCES vz_incidents(id),
add column match_status text default 'unprocessed';

CREATE INDEX idx_cad_incidents_match_status ON cad_incidents (match_status);
CREATE INDEX idx_cad_incidents_vz_incident_id ON cad_incidents(vz_incident_id);

