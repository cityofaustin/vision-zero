CREATE OR REPLACE VIEW view_crashes_mainlane_cr3 AS
SELECT atc.*
FROM atd_txdot_crashes AS atc,
     cr3_mainlanes AS cr3m
WHERE 1 = 1
  AND atc.position && cr3m.geometry
  AND ST_Contains(
        ST_Transform(ST_Buffer(ST_Transform(cr3m.geometry, 2277), 1, 'endcap=flat join=round'),
                     4326), /* transform into 2277 to buffer by a foot, not a degree */
        atc.position
  );
