ALTER TABLE atd_txdot_locations rename column location_name to description;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection DROP DEFAULT;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection TYPE integer
    USING CASE WHEN is_intersection = TRUE THEN 1 ELSE 0 END;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection SET DEFAULT 0;

ALTER TABLE atd_txdot_locations
    drop column is_signalized,
    drop column is_hin,
    drop column is_service_road,
    drop column council_districts,
    drop column signal_eng_areas,
    drop column area_eng_areas,
    drop column zip_codes,
    drop column apd_sectors,
    drop column street_levels,
    drop column signal_id,
    drop column signal_type,
    drop column signal_status,
    drop column is_deleted;
