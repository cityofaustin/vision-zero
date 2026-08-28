-- Most recent migration: database/migrations/default/1787848628285_ems_crash_list_view/up.sql

CREATE OR REPLACE VIEW ems_unmatched_incident_injury_metrics_view AS
SELECT
    incident_number,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 0 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS unkn_injry_count,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 2 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS nonincap_injry_count,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 3 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS poss_injry_count,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 5 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS non_injry_count,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS sus_serious_injry_count,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 2 THEN 1
            ELSE 0
        END), 0::bigint) + COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 3 THEN 1
            ELSE 0
        END), 0::bigint) + COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS tot_injry_count,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS fatality_count,
    COALESCE(SUM(
        CASE
            WHEN patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS vz_fatality_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Motor Vehicle'::text AND patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS motor_vehicle_fatality_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Motor Vehicle'::text AND patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS motor_vehicle_sus_serious_injry_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Motorcycle'::text AND patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS motorcycle_fatality_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Motorcycle'::text AND patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS motorcycle_sus_serious_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Bicycle'::text AND patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS bicycle_fatality_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Bicycle'::text AND patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS bicycle_sus_serious_injry_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Pedestrian'::text AND patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS pedestrian_fatality_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'Pedestrian'::text AND patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS pedestrian_sus_serious_injry_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'E-Scooter'::text AND patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS micromobility_fatality_count,
    COALESCE(SUM(
        CASE
            WHEN travel_mode = 'E-Scooter'::text AND patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS micromobility_sus_serious_injry_count,
    COALESCE(SUM(
        CASE
            WHEN
                (
                    travel_mode
                    <> ALL(
                        ARRAY[
                            'Motor Vehicle'::text,
                            'Motorcycle'::text,
                            'Bicycle'::text,
                            'Pedestrian'::text,
                            'E-Scooter'::text
                        ]
                    )
                )
                AND patient_injry_sev_id = 4
                THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS other_fatality_count,
    COALESCE(SUM(
        CASE
            WHEN
                (
                    travel_mode
                    <> ALL(
                        ARRAY[
                            'Motor Vehicle'::text,
                            'Motorcycle'::text,
                            'Bicycle'::text,
                            'Pedestrian'::text,
                            'E-Scooter'::text
                        ]
                    )
                )
                AND patient_injry_sev_id = 1
                THEN 1
            ELSE 0
        END
    ), 0::bigint)                                         AS other_sus_serious_injry_count,
    CASE
        WHEN SUM(
            CASE
                WHEN patient_injry_sev_id = 4 THEN 1
                ELSE 0
            END
        ) > 0 THEN 4
        WHEN SUM(
            CASE
                WHEN patient_injry_sev_id = 1 THEN 1
                ELSE 0
            END
        ) > 0 THEN 1
        WHEN SUM(
            CASE
                WHEN patient_injry_sev_id = 2 THEN 1
                ELSE 0
            END
        ) > 0 THEN 2
        WHEN SUM(
            CASE
                WHEN patient_injry_sev_id = 3 THEN 1
                ELSE 0
            END
        ) > 0 THEN 3
        WHEN SUM(
            CASE
                WHEN patient_injry_sev_id = 0 THEN 1
                ELSE 0
            END
        ) > 0 THEN 0
        WHEN SUM(
            CASE
                WHEN patient_injry_sev_id = 5 THEN 1
                ELSE 0
            END
        ) > 0 THEN 5
        ELSE 0
    END                                                   AS crash_injry_sev_id,
    COALESCE(SUM(years_of_life_lost), 0::bigint::numeric) AS years_of_life_lost,
    MAX(est_comp_cost_crash_based)                        AS est_comp_cost_crash_based,
    SUM(est_comp_cost_crash_based)                        AS est_total_person_comp_cost,
    STRING_AGG(DISTINCT travel_mode, ' & '::text)         AS units_involved,
    MIN(incident_location_address)                        AS incident_location_address,
    (ARRAY_AGG(geometry))[1]                              AS geometry,
    MIN(austin_full_purpose::integer)::boolean            AS austin_full_purpose,
    MIN(location_id)                                      AS location_id,
    MIN(latitude)                                         AS latitude,
    MIN(longitude)                                        AS longitude,
    MIN(incident_received_datetime)                       AS incident_received_datetime
FROM ems__incidents e
WHERE is_deleted = false AND person_id IS null AND crash_pk IS null
GROUP BY incident_number;
