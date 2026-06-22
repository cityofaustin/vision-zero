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
    WHERE ci.vz_incident_id IS NOT NULL
    UNION ALL
    SELECT
        ems.vz_incident_id,
        'ems__incidents'::text           AS record_type,
        'ems'                            AS record_responding_agency,
        ems.id                           AS record_id,
        ems.incident_number              AS record_incident_number,
        ems.incident_received_datetime   AS record_timestamp,
        ems.incident_location_address    AS record_address,
        ems.geometry                     AS geom
    FROM ems__incidents ems
    WHERE ems.vz_incident_id IS NOT NULL
    UNION ALL
    SELECT
        afd.vz_incident_id,
        'afd__incidents'::text           AS record_type,
        'afd'                            AS record_responding_agency,
        afd.id                           AS record_id,
        afd.incident_number::text        AS record_incident_number,
        afd.call_datetime                AS record_timestamp,
        afd.address                      AS record_address,
        afd.geometry                     AS geom
    FROM afd__incidents afd
    WHERE afd.vz_incident_id IS NOT NULL;

COMMENT ON VIEW public.vz_incident_records_view IS 'Unified view of records (crashes, cad_incidents, ems__incidents, afd__incidents) belonging to a vz_incident, exposed under a common schema for cross-type queries and geo-temporal matching.';


CREATE OR REPLACE FUNCTION public.afd_match_vz_incident()
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

    
    -- First try: exact match on matched_by_automation_incident_number
    raise debug 'Attempting to match incident # %', NEW.incident_number;

    SELECT vz_incident_id
    INTO v_vz_incident_id
    FROM cad_incidents
    WHERE agency_type_short = 'afd'
    AND master_incident_number = NEW.incident_number::text
    LIMIT 1;

    IF v_vz_incident_id IS NOT NULL THEN
        NEW.vz_incident_id := v_vz_incident_id;
        NEW.vz_incident_matched_ids := ARRAY[v_vz_incident_id];
        NEW.vz_incident_match_status := 'matched_by_automation_incident_number';

        raise debug 'Matched to VZ incident ID % based on incident # %', v_vz_incident_id, NEW.incident_number;
        -- no further processing needed
        RETURN NEW;
    raise debug 'Incident number match not found';
    END IF;

    -- Fallback: spatial + temporal proximity (only if we have the data to do it)
    IF NEW.geometry IS NOT NULL AND NEW.call_datetime IS NOT NULL THEN
        -- A vz_incident matches if ANY of its member events (crash, cad_incident,
        -- or ems__incident, afd__incident) is within the spatial + temporal threshold. Query the
        -- unified vz_incident_records_view and group by vz_incident_id so each
        -- distinct container is counted once, regardless of member type or count.
        SELECT count(*), array_agg(v.vz_incident_id)
        INTO v_match_count, v_matched_ids
        FROM (
            SELECT v.vz_incident_id
            FROM vz_incident_records_view v
            WHERE v.geom IS NOT NULL
              AND v.vz_incident_id IS NOT NULL
              AND v.record_timestamp >= (NEW.call_datetime - time_threshold)
              AND v.record_timestamp <= (NEW.call_datetime + time_threshold)
              AND ST_DWithin(v.geom::geography, NEW.geometry::geography, meters_threshold)
            GROUP BY v.vz_incident_id
        ) v;

        IF v_match_count > 1 THEN
            NEW.vz_incident_id := NULL;
            NEW.vz_incident_matched_ids := v_matched_ids;
            NEW.vz_incident_match_status := 'multiple_matches_by_automation';
            raise debug 'Multiple incident matches found';

        ELSIF v_match_count = 1 THEN
            NEW.vz_incident_id := v_matched_ids[1];
            NEW.vz_incident_matched_ids := v_matched_ids;
            NEW.vz_incident_match_status := 'matched_by_automation_geo_temporal';
            raise debug 'Matched to incident % based on geo/temporal', v_matched_ids[1];

        -- no match found: create a new VZ incident
        ELSE
            INSERT INTO vz_incidents (id) VALUES (DEFAULT)
            RETURNING id INTO v_vz_incident_id;
            NEW.vz_incident_id := v_vz_incident_id;
            NEW.vz_incident_matched_ids := NULL;
            NEW.vz_incident_match_status := 'created_by_automation';
            raise debug 'No matching incident found. Created incident %', v_vz_incident_id;
        END IF;
        -- Done processing
        RETURN NEW;

    -- Can't match (missing position/timestamp): create a new VZ incident
    ELSE
        INSERT INTO vz_incidents (id) VALUES (DEFAULT)
        RETURNING id INTO v_vz_incident_id;
        NEW.vz_incident_id := v_vz_incident_id;
        NEW.vz_incident_matched_ids := NULL;
        NEW.vz_incident_match_status := 'created_by_automation';
        raise debug 'Not enough data to match incident. Created incident %', v_vz_incident_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$function$;

comment on function afd_match_vz_incident is 'Function which matches afd__incidents to vz_incidents and creates new vz_incidents when no match can be found.';

CREATE OR REPLACE TRIGGER afd_incidents_trigger_vz_incident_match_insert
    BEFORE INSERT ON public.afd__incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.afd_match_vz_incident();
