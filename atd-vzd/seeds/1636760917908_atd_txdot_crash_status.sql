-- -------------------------------------------------------------
-- Database: atd_vz_data
-- Generation Time: 2021-11-12 17:48:00.1190
-- -------------------------------------------------------------


INSERT INTO "public"."atd_txdot_crash_status" ("crash_status_id", "description", "description_long", "last_update", "is_retired") VALUES
(0, 'No Known Status', 'No Known Status', '2019-08-29', 'f'),
(1, 'Copied from CRIS to Primary', 'The latitude/longitude coordinates were copied from the original CRIS values to the primary lat/long coordinates.', '2019-08-29', 'f'),
(2, 'Copied from GeoCoder provider Primary', 'The lat/long coordinates as provided by the geocoder have been copied over to the primary lat/long values. Not yet verified.', '2019-08-29', 'f'),
(3, 'Lat/Long entered manually to Primary', 'The Lat/Long values in the Primary fields have been entered manually.', '2019-08-29', 'f');

