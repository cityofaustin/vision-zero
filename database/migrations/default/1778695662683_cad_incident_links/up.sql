CREATE TABLE cad_incident_links (
    id                  serial PRIMARY KEY,
    group_id uuid NOT NULL,
    incident_id_a       integer NOT NULL REFERENCES cad_incidents (master_incident_id),
    incident_id_b       integer NOT NULL REFERENCES cad_incidents (master_incident_id),
    distance_m          float NOT NULL,
    delta_minutes       float NOT NULL,
    created_at          timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT no_duplicate_pairs CHECK (incident_id_a < incident_id_b),
    CONSTRAINT unique_pair UNIQUE (incident_id_a, incident_id_b)
);

CREATE INDEX idx_cad_incident_links_group_id ON cad_incident_links(group_id);
CREATE INDEX idx_cad_incident_links_a ON cad_incident_links (incident_id_a);
CREATE INDEX idx_cad_incident_links_b ON cad_incident_links (incident_id_b);

alter table cad_incidents add column match_status text default 'unprocessed';
CREATE INDEX idx_cad_incidents_match_status ON cad_incidents (match_status);

