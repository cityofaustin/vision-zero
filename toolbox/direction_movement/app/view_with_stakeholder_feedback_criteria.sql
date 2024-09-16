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
        ) AS update_statement
    FROM movement_direction_corrections
        JOIN atd_txdot_crashes crashes
        ON (
            movement_direction_corrections.crash_id = crashes.crash_id
        )
    WHERE
        movement_direction_corrections.potential IS TRUE AND
        NOT (
            crashes.qa_status = 3 AND
            last_update >= '2022-03-01'
        )
        AND
        NOT (
            movement_direction_corrections.field = 'travel_direction' AND
            movement_direction_corrections.cardinal_direction IS FALSE
        ) AND
        NOT (
            movement_direction_corrections.field = 'movement_id' AND
            movement_direction_corrections.value = 0
        )
);
