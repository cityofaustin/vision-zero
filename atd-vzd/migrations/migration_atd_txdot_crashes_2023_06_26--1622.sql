ALTER TABLE atd_txdot_crashes
ADD COLUMN in_austin_full_purpose boolean GENERATED ALWAYS AS (is_crash_in_austin_full_purpose(position, city_id)) STORED NOT NULL;
