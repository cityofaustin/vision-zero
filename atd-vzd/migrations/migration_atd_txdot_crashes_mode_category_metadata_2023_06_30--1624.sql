-- this is a one-time script to update the atd_txdot_crashes atd_mode_category_metadata column
-- to reflect changes made to units records vehicle type and body style columns
UPDATE atd_txdot_crashes SET atd_mode_category_metadata = get_crash_modes(crash_id)
