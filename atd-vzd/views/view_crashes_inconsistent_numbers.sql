create view view_crashes_inconsistent_numbers
            (atc_crash_id, atc_death_cnt, atu_death_cnt, atpp_death_cnt, atp_death_cnt, sus_serious_injry_cnt,
             atu_sus_serious_injry_cnt, atpp_sus_serious_injry_cnt, atp_sus_serious_injry_cnt)
as
WITH persons AS (
    SELECT atd_txdot_person.crash_id,
           sum(atd_txdot_person.death_cnt)             AS death_cnt,
           sum(atd_txdot_person.sus_serious_injry_cnt) AS sus_serious_injry_cnt
    FROM atd_txdot_person
    GROUP BY atd_txdot_person.crash_id
),
     primarypersons AS (
         SELECT atd_txdot_primaryperson.crash_id,
                sum(atd_txdot_primaryperson.death_cnt)             AS death_cnt,
                sum(atd_txdot_primaryperson.sus_serious_injry_cnt) AS sus_serious_injry_cnt
         FROM atd_txdot_primaryperson
         GROUP BY atd_txdot_primaryperson.crash_id
     ),
     units AS (
         SELECT atd_txdot_units.crash_id,
                sum(atd_txdot_units.death_cnt)             AS death_cnt,
                sum(atd_txdot_units.sus_serious_injry_cnt) AS sus_serious_injry_cnt
         FROM atd_txdot_units
         GROUP BY atd_txdot_units.crash_id
     )
SELECT atc.crash_id                                   AS atc_crash_id,
       atc.death_cnt                                  AS atc_death_cnt,
       atu.death_cnt                                  AS atu_death_cnt,
       atpp.death_cnt                                 AS atpp_death_cnt,
       COALESCE(atp.death_cnt, 0::bigint)             AS atp_death_cnt,
       atc.sus_serious_injry_cnt,
       atu.sus_serious_injry_cnt                      AS atu_sus_serious_injry_cnt,
       atpp.sus_serious_injry_cnt                     AS atpp_sus_serious_injry_cnt,
       COALESCE(atp.sus_serious_injry_cnt, 0::bigint) AS atp_sus_serious_injry_cnt
FROM atd_txdot_crashes atc
         LEFT JOIN persons atp ON atc.crash_id = atp.crash_id
         LEFT JOIN primarypersons atpp ON atc.crash_id = atpp.crash_id
         LEFT JOIN units atu ON atc.crash_id = atu.crash_id
WHERE 1 = 1
  AND (austin_full_purpose = 'Y' OR (atc.city_id = 22 and atc.position IS NULL))
  AND (atc.death_cnt <> (atp.death_cnt + atpp.death_cnt) OR atc.death_cnt <> atu.death_cnt OR
       atc.sus_serious_injry_cnt <> (atp.sus_serious_injry_cnt + atpp.sus_serious_injry_cnt) OR
       atc.sus_serious_injry_cnt <> atu.sus_serious_injry_cnt);

alter table view_crashes_inconsistent_numbers
    owner to atd_vz_data;

