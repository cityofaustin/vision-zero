-- -------------------------------------------------------------
-- Database: atd_vz_data
-- Generation Time: 2021-11-12 18:11:02.0400
-- -------------------------------------------------------------


INSERT INTO "public"."atd_txdot_change_status" ("change_status_id", "description", "description_long", "last_update", "is_retired") VALUES
(-1, 'Change Rejected', 'The incoming record has been rejected.', '2019-12-09', 'f'),
(0, 'New Record Received', 'A new record has been received straight from CRIS, it has not yet been reviewed.', '2019-12-09', 'f'),
(1, 'Changes Accepted', 'All changes have been accepted', '2019-12-09', 'f'),
(2, 'Partly Accepted', 'One or more changes (but not all) have been accepted.', '2019-12-09', 'f');

