-- Creates an additional column for original_city_id, and indexing for search.
ALTER TABLE atd_txdot_crashes ADD original_city_id int;

CREATE INDEX atd_txdot_crashes_original_city_id_index
    ON atd_txdot_crashes (original_city_id);
 