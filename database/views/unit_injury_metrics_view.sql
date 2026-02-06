-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW unit_injury_metrics_view AS SELECT
    units.id,
    units.crash_pk,
    COALESCE(SUM(person_injury_metrics_view.unkn_injry), 0::bigint)           AS unkn_injry_count,
    COALESCE(SUM(person_injury_metrics_view.nonincap_injry), 0::bigint)       AS nonincap_injry_count,
    COALESCE(SUM(person_injury_metrics_view.poss_injry), 0::bigint)           AS poss_injry_count,
    COALESCE(SUM(person_injury_metrics_view.non_injry), 0::bigint)            AS non_injry_count,
    COALESCE(SUM(person_injury_metrics_view.sus_serious_injry), 0::bigint)    AS sus_serious_injry_count,
    COALESCE(SUM(person_injury_metrics_view.fatal_injury), 0::bigint)         AS fatality_count,
    COALESCE(SUM(person_injury_metrics_view.vz_fatal_injury), 0::bigint)      AS vz_fatality_count,
    COALESCE(SUM(person_injury_metrics_view.law_enf_fatal_injury), 0::bigint) AS law_enf_fatality_count,
    COALESCE(SUM(person_injury_metrics_view.cris_fatal_injury), 0::bigint)    AS cris_fatality_count,
    COALESCE(SUM(person_injury_metrics_view.years_of_life_lost), 0::bigint)   AS years_of_life_lost
FROM units
LEFT JOIN person_injury_metrics_view ON units.id = person_injury_metrics_view.unit_id
WHERE units.is_deleted = false
GROUP BY units.id;
