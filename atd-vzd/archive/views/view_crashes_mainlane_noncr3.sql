CREATE OR REPLACE VIEW view_crashes_mainlane_noncr3 AS
SELECT aab.*
FROM atd_apd_blueform AS aab,
     non_cr3_mainlanes AS ncr3m
WHERE 1 = 1
  AND aab.position && ncr3m.geometry
  AND ST_Contains(
        ST_Transform(ST_Buffer(ST_Transform(ncr3m.geometry, 2277), 1, 'endcap=flat join=round'),
                     4326), /* transform into 2277 to buffer by a foot, not a degree */
        aab.position
    );
