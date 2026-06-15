ALTER TABLE crashes
    ADD COLUMN vz_incident_id bigint
        REFERENCES vz_incidents(id),
    ADD COLUMN vz_incident_match_status text,
    ADD COLUMN vz_incident_matched_ids bigint[],
    ADD CONSTRAINT crashes_vz_incident_match_status_check default 'unprocessed' 
    CHECK (
    person_match_status IN (
        'unprocessed',
        'incident_created',
        'matched_by_automation',
        'multiple_matches_by_automation',
        'matched_by_manual_qa',
    )
);

COMMENT ON COLUMN public.crashes.vz_incident_id is 'The vz_incidents foreign key.';

CREATE INDEX idx_crashes_vz_incident_id ON crashes(vz_incident_id);
CREATE INDEX vz_incident_match_status ON crashes(vz_incident_match_status);
CREATE INDEX idx_cad_incidents_master_incident_number ON cad_incidents(master_incident_number);

CREATE OR REPLACE VIEW public.vz_incident_events AS
    SELECT
        c.vz_incident_id,
        'crash'::text        AS source_type,
        c.id                 AS source_id,
        c.crash_timestamp    AS event_ts,
        c.position           AS geom
    FROM crashes c
    WHERE c.vz_incident_id IS NOT NULL

    UNION ALL

    SELECT
        ci.vz_incident_id,
        'cad_incident'::text AS source_type,
        ci.id                AS source_id,
        ci.response_date     AS event_ts,
        ci.geom              AS geom
    FROM cad_incidents ci
    WHERE ci.vz_incident_id IS NOT NULL

    -- Third record type goes here later:
    -- UNION ALL
    -- SELECT
    --     t.vz_incident_id,
    --     'tbd'::text       AS source_type,
    --     t.id              AS source_id,
    --     t.event_timestamp AS event_ts,
    --     t.geom            AS geom
    -- FROM tbd_table t
    -- WHERE t.vz_incident_id IS NOT NULL
;


CREATE OR REPLACE FUNCTION public.crashes_match_vz_incident()
RETURNS trigger
LANGUAGE plpgsql AS
$function$
DECLARE
    v_vz_incident_id bigint;
    v_matched_ids bigint[];
    v_match_count integer;
    meters_threshold integer := 1200;
    time_threshold interval := '30 minutes';
BEGIN
    -- should never happen: trigger on insert only
    if (NEW.vz_incident_id IS NOT NULL) THEN
        return NEW;
    END IF;

    -- todo: we need incidents for non-APD?
    -- IF (NEW.investigat_agency_id != 74 OR NEW.case_id IS NULL OR NEW.vz_incident_id IS NOT NULL) THEN
    --     RETURN NEW;
    -- END IF;


    IF (NEW.investigat_agency_id = 74 AND NEW.case_id IS NOT NULL) THEN

        -- First try: exact match on case_id
        SELECT vz_incident_id
        INTO v_vz_incident_id
        FROM cad_incidents
        WHERE agency_type = 'AUSTIN PD'
        AND master_incident_number = NEW.case_id
        LIMIT 1;

        IF v_vz_incident_id IS NOT NULL THEN
            NEW.vz_incident_id := v_vz_incident_id;
            NEW.vz_incident_matched_ids := ARRAY[v_vz_incident_id];
            NEW.vz_incident_match_status := 'matched_by_automation';
    ende if;

    -- todo: update this to match on in incident
    -- Fallback: spatial + temporal proximity (only if we have the data to do it)
    ELSIF NEW.position IS NOT NULL
       AND NEW.crash_timestamp IS NOT NULL THEN

        SELECT count(*), array_agg(c.vz_incident_id)
        INTO v_match_count, v_matched_ids
        FROM cad_incidents c
        WHERE c.geom IS NOT NULL
          AND c.vz_incident_id IS NOT NULL
          AND c.response_date >= (NEW.crash_timestamp - time_threshold)
          AND c.response_date <= (NEW.crash_timestamp + time_threshold)
          AND ST_DWithin(c.geom::geography, NEW.position::geography, meters_threshold);

        IF v_match_count > 1 THEN
            NEW.vz_incident_id := NULL;
            NEW.vz_incident_matched_ids := v_matched_ids;
            NEW.vz_incident_match_status := 'multiple_matches_by_automation';

        ELSIF v_match_count = 1 THEN
            NEW.vz_incident_id := v_matched_ids[1];
            NEW.vz_incident_matched_ids := v_matched_ids;
            NEW.vz_incident_match_status := 'matched_by_automation';

        -- no match found: create a new VZ incident
        ELSE
            INSERT INTO vz_incidents (id) VALUES (DEFAULT)
            RETURNING id INTO v_vz_incident_id;
            NEW.vz_incident_id := v_vz_incident_id;
            NEW.vz_incident_matched_ids := NULL;
            NEW.vz_incident_match_status := 'incident_created';
        END IF;

    -- Can't match (missing position/timestamp) and no exact match: create a new VZ incident
    ELSE
        INSERT INTO vz_incidents (id) VALUES (DEFAULT)
        RETURNING id INTO v_vz_incident_id;
        NEW.vz_incident_id := v_vz_incident_id;
        NEW.vz_incident_matched_ids := NULL;
        NEW.vz_incident_match_status := 'incident_created';
    END IF;

    RETURN NEW;
END;
$function$;


-- todo: check trigger order
CREATE OR REPLACE TRIGGER crashes_match_vz_incident
    BEFORE INSERT ON public.crashes
    FOR EACH ROW
    EXECUTE FUNCTION public.crashes_match_vz_incident();


UPDATE crashes cr
SET vz_incident_id = m.vz_incident_id
FROM (
    SELECT
        c.id AS crash_id,
        COALESCE(
            exact.vz_incident_id,
            CASE WHEN prox.match_count = 1 THEN prox.vz_incident_id END
        ) AS vz_incident_id
    FROM crashes c

    -- Stage 1: exact case_id match
    LEFT JOIN LATERAL (
        SELECT ci.vz_incident_id
        FROM cad_incidents ci
        WHERE ci.agency_type = 'AUSTIN PD'
          AND ci.master_incident_number = c.case_id
        LIMIT 1
    ) exact ON TRUE

    -- Stage 2: proximity match (only relevant when exact match missing)
    -- todo: do we want to match on agency_type here? i think no..
    -- or match proximiy to incidents?
    LEFT JOIN LATERAL (
        SELECT count(*) AS match_count, min(ci.vz_incident_id) AS vz_incident_id
        FROM cad_incidents ci
        WHERE ci.geom IS NOT NULL
          AND ci.response_date >= (c.crash_timestamp - INTERVAL '30 minutes')
          AND ci.response_date <= (c.crash_timestamp + INTERVAL '30 minutes')
          AND ST_DWithin(ci.geom::geography, c.position::geography, 1200)
    ) prox ON (exact.vz_incident_id IS NULL
               AND c.position IS NOT NULL
               AND c.crash_timestamp IS NOT NULL)

    WHERE c.investigat_agency_id = 74
      AND c.case_id IS NOT NULL
    AND c.crash_timestamp >= '2026-01-01'   -- <-- moving window
      AND c.crash_timestamp <  '2027-02-01'   -- <-- moving window
) m
WHERE cr.id = m.crash_id;