-- migrate contrib factor "CELL/MOBILE  PHONE USE" to "CELL/MOBILE DEVICE USE - UNKNOWN"
-- only affects crashes pre-2015
update units_cris set contrib_factr_1_id = 78 where contrib_factr_1_id = 72;
update units_cris set contrib_factr_2_id = 78 where contrib_factr_2_id = 72;
update units_cris set contrib_factr_3_id = 78 where contrib_factr_3_id = 72;
update units_cris set contrib_factr_p1_id = 78 where contrib_factr_p1_id = 72;
update units_cris set contrib_factr_p2_id = 78 where contrib_factr_p2_id = 72;
delete from lookups.contrib_factr where id = 72;
