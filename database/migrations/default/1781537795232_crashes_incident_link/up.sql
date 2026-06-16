ALTER TABLE crashes
ADD COLUMN vz_incident_id bigint REFERENCES vz_incidents (id),
ADD COLUMN vz_incident_match_status text NOT NULL DEFAULT 'unprocessed',
ADD COLUMN vz_incident_matched_ids BIGINT[],
ADD CONSTRAINT crashes_vz_incident_match_status_check CHECK (
    vz_incident_match_status IN (
        'unprocessed',
        'created_by_automation',
        'matched_by_automation_case_id',
        'matched_by_automation_geo_temporal',
        'multiple_matches_by_automation',
        'matched_by_manual_qa')
);

COMMENT ON COLUMN public.crashes.vz_incident_id is 'The vz_incidents foreign key.';

CREATE INDEX idx_crashes_vz_incident_id ON crashes(vz_incident_id);
CREATE INDEX idx_vz_incident_match_status ON crashes(vz_incident_match_status);

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
    ) stored;

comment on column cad_incidents.agency_type_short is 'The abbreviated name of the responding agency';

CREATE INDEX idx_cad_incidents_master_incident_number ON cad_incidents(master_incident_number);
CREATE INDEX idx_cad_incidents_agency_type_short ON cad_incidents(agency_type_short);

CREATE OR REPLACE VIEW public.vz_incident_records_view AS
    SELECT
        c.vz_incident_id,
        'crash'::text        AS record_type,
        agency.label         AS record_responding_agency,
        c.id                 AS record_id,
        c.case_id            AS record_incident_number,
        c.crash_timestamp    AS record_timestamp,
        c.address_display    AS record_address,
        c.position           AS geom
    FROM crashes c
        LEFT JOIN lookups.agency agency on agency.id = c.investigat_agency_id
    WHERE c.vz_incident_id IS NOT NULL and c.is_deleted is false
    UNION ALL
    SELECT
        ci.vz_incident_id,
        'cad_incident'::text        AS record_type,
        ci.agency_type_short        AS record_responding_agency,
        ci.id                       AS record_id,
        ci.master_incident_number   AS record_incident_number,
        ci.response_date            AS record_timestamp,
        ci.address                  AS record_address,
        ci.geom                     AS geom
    FROM cad_incidents ci
    WHERE ci.vz_incident_id IS NOT NULL;

COMMENT ON VIEW public.vz_incident_records_view is 'Something helpful';

CREATE OR REPLACE FUNCTION public.crashes_match_vz_incident()
RETURNS trigger
LANGUAGE plpgsql AS
$function$
DECLARE
    v_vz_incident_id bigint;
    v_matched_ids bigint[];
    v_match_count integer;
    meters_threshold integer := 500;
    time_threshold interval := '60 minutes';
BEGIN
    -- safety check: vz_incident_id should never be non-null
    IF (NEW.vz_incident_id IS NOT NULL) THEN
        RETURN NEW;
    END IF;

    IF (NEW.investigat_agency_id = 74 AND NEW.case_id IS NOT NULL) THEN
        -- First try: exact match APD crashes on case_id
        SELECT vz_incident_id
        INTO v_vz_incident_id
        FROM cad_incidents
        WHERE agency_type = 'AUSTIN PD'
        AND master_incident_number = NEW.case_id
        LIMIT 1;

        IF v_vz_incident_id IS NOT NULL THEN
            NEW.vz_incident_id := v_vz_incident_id;
            NEW.vz_incident_matched_ids := ARRAY[v_vz_incident_id];
            NEW.vz_incident_match_status := 'matched_by_automation_case_id';
            -- no further processing needed
            RETURN NEW;
        END IF;
    END IF;

    -- Fallback: spatial + temporal proximity (only if we have the data to do it)
    IF NEW.position IS NOT NULL
       AND NEW.crash_timestamp IS NOT NULL
       AND NEW.investigat_agency_id = 74 THEN
        -- A vz_incident matches if ANY of its member events (crash, cad_incident,
        -- or future types) is within the spatial + temporal threshold. Query the
        -- unified vz_incident_records_view and group by vz_incident_id so each
        -- distinct container is counted once, regardless of member type or count.
        SELECT count(*), array_agg(v.vz_incident_id)
        INTO v_match_count, v_matched_ids
        FROM (
            SELECT v.vz_incident_id
            FROM vz_incident_records_view v
            WHERE v.geom IS NOT NULL
              AND v.vz_incident_id IS NOT NULL
              AND v.record_timestamp >= (NEW.crash_timestamp - time_threshold)
              AND v.record_timestamp <= (NEW.crash_timestamp + time_threshold)
              AND ST_DWithin(v.geom::geography, NEW.position::geography, meters_threshold)
            GROUP BY v.vz_incident_id
        ) g;

        IF v_match_count > 1 THEN
            NEW.vz_incident_id := NULL;
            NEW.vz_incident_matched_ids := v_matched_ids;
            NEW.vz_incident_match_status := 'multiple_matches_by_automation';
            -- todo: create an incident for this case?

        ELSIF v_match_count = 1 THEN
            NEW.vz_incident_id := v_matched_ids[1];
            NEW.vz_incident_matched_ids := v_matched_ids;
            NEW.vz_incident_match_status := 'matched_by_automation_geo_temporal';

        -- no match found: create a new VZ incident
        ELSE
            INSERT INTO vz_incidents (id) VALUES (DEFAULT)
            RETURNING id INTO v_vz_incident_id;
            NEW.vz_incident_id := v_vz_incident_id;
            NEW.vz_incident_matched_ids := NULL;
            NEW.vz_incident_match_status := 'created_by_automation';
        END IF;
        -- Done processing
        RETURN NEW;

    -- Can't match (missing position/timestamp) or non-APD crash: create a new VZ incident
    ELSE
        INSERT INTO vz_incidents (id) VALUES (DEFAULT)
        RETURNING id INTO v_vz_incident_id;
        NEW.vz_incident_id := v_vz_incident_id;
        NEW.vz_incident_matched_ids := NULL;
        NEW.vz_incident_match_status := 'created_by_automation';
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$function$;

comment on function crashes_match_vz_incident is 'Function which matches crashes to vz_incidents and creates new vz_incidents when no match can be found.'

-- todo: check trigger order
CREATE OR REPLACE TRIGGER crashes_match_vz_incident_trigger
    BEFORE INSERT ON public.crashes
    FOR EACH ROW
    EXECUTE FUNCTION public.crashes_match_vz_incident();
