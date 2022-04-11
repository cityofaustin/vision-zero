CREATE OR
REPLACE VIEW check_vz_restore AS (
    SELECT
        movement_direction_corrections. *,
        crashes.qa_status,
        crashes.position,
        concat(
            'update atd_txdot_units set ',
            field,
            ' = ',
            value,
            ' where unit_id = ',
            unit_id,
            ';'
        )
    FROM movement_direction_corrections
        JOIN atd_txdot_crashes crashes
        ON (
            movement_direction_corrections.crash_id = crashes.crash_id
        )
    WHERE
        movement_direction_corrections.potential IS TRUE AND
        NOT (
            1 = 1 AND
            crashes.qa_status = 3 AND
            last_update >= '2022-03-01' AND
            movement_direction_corrections.cardinal_direction IS TRUE
        )
);
