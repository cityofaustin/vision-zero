--
-- crashes updates
--
ALTER TABLE crashes
ADD COLUMN vz_incident_id bigint REFERENCES vz_incidents (id),
ADD COLUMN vz_incident_match_status text NOT NULL DEFAULT 'unprocessed',
ADD COLUMN vz_incident_matched_ids BIGINT[],
ADD CONSTRAINT crashes_vz_incident_match_status_check CHECK (
    vz_incident_match_status IN (
        'unprocessed',
        'created_by_automation',
        'matched_by_automation_incident_number',
        'matched_by_automation_geo_temporal',
        'multiple_matches_by_automation',
        'matched_by_manual_qa')
);

COMMENT ON COLUMN public.crashes.vz_incident_id is 'The vz_incidents foreign key.';
COMMENT ON COLUMN public.crashes.vz_incident_match_status is 'Indicates the status of automated crash-vz_incident matching.';
COMMENT ON COLUMN public.crashes.vz_incident_matched_ids is 'Array of  vz_incident_id''s to which this crash was matched.';

CREATE INDEX idx_crashes_vz_incident_id ON crashes(vz_incident_id);
CREATE INDEX idx_vz_incident_match_status ON crashes(vz_incident_match_status);

--
-- cad incidents update
--
ALTER TABLE cad_incidents
    ADD CONSTRAINT cad_incidents_agency_type_check CHECK (
            agency_type IN ('AUSTIN PD', 'FIRE', 'AUSTIN-TRAVIS COUNTY  EMS')
    ),
    ADD COLUMN agency_type_short text generated always AS (
        CASE
            WHEN agency_type = 'AUSTIN PD' THEN 'apd'
            WHEN agency_type = 'FIRE' THEN 'afd'
            ELSE 'ems'
        END
    ) stored,
    ADD COLUMN vz_incident_match_status text NOT NULL DEFAULT 'unprocessed',
    ADD COLUMN vz_incident_matched_ids BIGINT[],
    ADD CONSTRAINT cad_incidents_vz_incident_match_status_check CHECK (
        vz_incident_match_status IN (
            'unprocessed',
            'created_by_automation',
            'matched_by_automation_incident_number',
            'matched_by_automation_geo_temporal',
            'multiple_matches_by_automation',
            'matched_by_manual_qa')
    );

COMMENT ON COLUMN public.cad_incidents.agency_type_short is 'The abbreviated name of the responding agency';
COMMENT ON COLUMN public.cad_incidents.vz_incident_match_status is 'Indicates the status of automated cad-vz_incident matching.';
COMMENT ON COLUMN public.cad_incidents.vz_incident_matched_ids is 'Array of  vz_incident_id''s to which this cad incident was matched.';

CREATE INDEX idx_cad_incidents_master_incident_number ON cad_incidents(master_incident_number);
CREATE INDEX idx_cad_incidents_agency_type_short ON cad_incidents(agency_type_short);
CREATE INDEX idx_cad_incidents_vz_incident_match_status on cad_incidents(vz_incident_match_status);

--
-- ems__incidents updates
--
ALTER TABLE ems__incidents
ADD COLUMN vz_incident_id bigint REFERENCES vz_incidents (id),
ADD COLUMN vz_incident_match_status text NOT NULL DEFAULT 'unprocessed',
ADD COLUMN vz_incident_matched_ids BIGINT[],
ADD CONSTRAINT ems__incidents_vz_incident_match_status_check CHECK (
    vz_incident_match_status IN (
        'unprocessed',
        'created_by_automation',
        'matched_by_automation_incident_number',
        'matched_by_automation_geo_temporal',
        'multiple_matches_by_automation',
        'matched_by_manual_qa')
);

COMMENT ON COLUMN public.ems__incidents.vz_incident_id is 'The vz_incidents foreign key.';
COMMENT ON COLUMN public.ems__incidents.vz_incident_match_status is 'Indicates the status of automated vz_incident matching.';
COMMENT ON COLUMN public.ems__incidents.vz_incident_matched_ids is 'Array of vz_incident_id''s to which this ems__incidents was matched.';

CREATE INDEX idx_ems__incidents_vz_incident_id ON ems__incidents(vz_incident_id);
CREATE INDEX idx_ems__incidents_vz_incident_match_status ON ems__incidents(vz_incident_match_status);



--
-- afd__incidents update
--
ALTER TABLE afd__incidents
ADD COLUMN vz_incident_id bigint REFERENCES vz_incidents (id),
ADD COLUMN vz_incident_match_status text NOT NULL DEFAULT 'unprocessed',
ADD COLUMN vz_incident_matched_ids BIGINT[],
ADD CONSTRAINT afd__incidents_vz_incident_match_status_check CHECK (
    vz_incident_match_status IN (
        'unprocessed',
        'created_by_automation',
        'matched_by_automation_incident_number',
        'matched_by_automation_geo_temporal',
        'multiple_matches_by_automation',
        'matched_by_manual_qa')
);

COMMENT ON COLUMN public.afd__incidents.vz_incident_id is 'The vz_incidents foreign key.';
COMMENT ON COLUMN public.afd__incidents.vz_incident_match_status is 'Indicates the status of automated vz_incident matching.';
COMMENT ON COLUMN public.afd__incidents.vz_incident_matched_ids is 'Array of vz_incident_id''s to which this afd__incidents was matched.';

CREATE INDEX idx_afd__incidents_vz_incident_id ON afd__incidents(vz_incident_id);
CREATE INDEX idx_afd__incidents_vz_incident_match_status ON afd__incidents(vz_incident_match_status);

--
-- unified records view
--
CREATE OR REPLACE VIEW public.vz_incident_records_view AS
    SELECT
        
        'crashes'::text            AS record_table_name,
        agency.label               AS record_responding_agency,
        c.id                       AS record_id,
        c.case_id                  AS record_incident_number,
        c.crash_timestamp          AS record_timestamp,
        c.address_display          AS record_address,
        c.position                 AS geom,
        c.vz_incident_id           AS vz_incident_id,
        c.vz_incident_match_status AS vz_incident_match_status
    FROM crashes c
        LEFT JOIN lookups.agency agency on agency.id = c.investigat_agency_id
    WHERE c.is_deleted is false
    UNION ALL
    SELECT
        'cad_incidents'::text       AS record_table_name,
        ci.agency_type_short        AS record_responding_agency,
        ci.id                       AS record_id,
        ci.master_incident_number   AS record_incident_number,
        ci.response_date            AS record_timestamp,
        ci.address                  AS record_address,
        ci.geom                     AS geom,
        ci.vz_incident_id           AS vz_incident_id,
        ci.vz_incident_match_status AS vz_incident_match_status
    FROM cad_incidents ci
    UNION ALL
    SELECT
        'ems__incidents'::text           AS record_table_name,
        'ems'                            AS record_responding_agency,
        ems.id                           AS record_id,
        ems.incident_number              AS record_incident_number,
        ems.incident_received_datetime   AS record_timestamp,
        ems.incident_location_address    AS record_address,
        ems.geometry                     AS geom,
        ems.vz_incident_id               AS vz_incident_id,
        ems.vz_incident_match_status     AS vz_incident_match_status
    FROM ems__incidents ems
    WHERE ems.is_deleted is FALSE
    UNION ALL
    SELECT
        'afd__incidents'::text           AS record_table_name,
        'afd'                            AS record_responding_agency,
        afd.id                           AS record_id,
        afd.incident_number::text        AS record_incident_number,
        afd.call_datetime                AS record_timestamp,
        afd.address                      AS record_address,
        afd.geometry                     AS geom,
        afd.vz_incident_id               AS vz_incident_id,
        afd.vz_incident_match_status     AS vz_incident_match_status
    FROM afd__incidents afd;

COMMENT ON VIEW public.vz_incident_records_view IS 'Unified view of crash-related records (crashes, cad_incidents, ems__incidents, afd__incidents) exposed under a common schema for cross-type queries and geo-temporal matching.';
