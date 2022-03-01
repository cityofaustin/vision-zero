CREATE 
OR replace view atd_txdot_changes_view AS WITH changes_formatted AS 
(
   SELECT
      *,
      atc.record_json::jsonb ->> 0 AS record_json_as_object 
   FROM
      atd_txdot_changes atc 
   WHERE
      record_type = 'crash'
)
SELECT
   record_id,
   change_id,
   record_json,
   created_timestamp,
   status_id,
   record_json_as_object::jsonb ->> 'crash_fatal_fl' AS crash_fatal_flag,
   record_json_as_object::jsonb ->> 'sus_serious_injry_cnt' AS sus_serious_injury_cnt,
   atcs.description AS status_description,
   crash_date
FROM
   changes_formatted 
   LEFT JOIN
      atd_txdot_change_status atcs
      ON changes_formatted.status_id = atcs.change_status_id