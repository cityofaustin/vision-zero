ALTER TABLE atd_txdot_crashes
ADD COLUMN council_district integer GENERATED ALWAYS AS (find_council_district(position)) STORED;
