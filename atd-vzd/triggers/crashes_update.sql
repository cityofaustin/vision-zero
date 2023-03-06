-- if crash location/coordinates is updated
-- go through all persons associated with that crash
-- and if that person was killed
-- and if the crash was previously outside of austin but now its in austin
-- add the person to the fatalities table
-- else if the crash was previously in austin but is now outside of austin
-- delete person from the fatalities table
-- else if the crash was in austin and is still in austin but the location changed
-- just update the location column for that person in the fatalities table

CREATE OR REPLACE FUNCTION crash_location_update() 
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
    DECLARE
        primary_person record;
        person record;
    BEGIN
        -- check if the position was updated
        IF (OLD.position IS DISTINCT FROM NEW.position) THEN
            -- loop thru fatalities in person table if there are any
            FOR person IN (SELECT person_id FROM atd_txdot_person WHERE crash_id = NEW.crash_id AND prsn_injry_sev_id = 4) loop
                -- if person is not in fatalities table but is in austin then add them
                IF (NOT EXISTS (SELECT person_id FROM fatalities WHERE person_id = person.person_id) AND ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    -- insert person into fatalities table
                    INSERT INTO fatalities (crash_id, person_id, year, location)
                    VALUES (NEW.crash_id, NEW.person_id, TO_CHAR(NEW.crash_date,'yyyy'), CONCAT_WS(' ', NEW.rpt_block_num, NEW.rpt_street_pfx, NEW.rpt_street_name, '(', NEW.rpt_sec_block_num, NEW.rpt_sec_street_pfx, NEW.rpt_sec_street_name, ')'));
                END IF;
                -- if person is in fatalities table but not in austin then remove them
                IF (EXISTS (SELECT person_id FROM fatalities WHERE person_id = person.person_id) AND NOT ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    DELETE FROM fatalities WHERE person_id = person.person_id;
                END IF;
            end loop;
            -- loop thru fatalities in primary person table if there are any
            FOR primary_person IN (SELECT primaryperson_id FROM atd_txdot_primaryperson WHERE crash_id = NEW.crash_id AND prsn_injry_sev_id = 4) loop
                -- if person is not in fatalities table but is in austin then add them
                IF (NOT EXISTS (SELECT primaryperson_id FROM fatalities WHERE primaryperson_id = primary_person.primaryperson_id) AND ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    -- insert person into fatalities table
                    INSERT INTO fatalities (crash_id, primaryperson_id, year, location)
                    VALUES (NEW.crash_id, NEW.primaryperson_id, TO_CHAR(NEW.crash_date,'yyyy'), CONCAT_WS(' ', NEW.rpt_block_num, NEW.rpt_street_pfx, NEW.rpt_street_name, '(', NEW.rpt_sec_block_num, NEW.rpt_sec_street_pfx, NEW.rpt_sec_street_name, ')'));
                END IF;
                -- if person is in fatalities table but not in austin then remove them
                IF (EXISTS (SELECT primaryperson_id FROM fatalities WHERE primaryperson_id = primary_person.primaryperson_id) AND NOT ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    DELETE FROM fatalities WHERE primaryperson_id = primary_person.primaryperson_id;
                END IF;
            end loop;
        END IF;
        -- if the crash date was updated then update the year column for that crash in the fatalities table
        IF (OLD.crash_date IS DISTINCT FROM NEW.crash_date) THEN
            UPDATE fatalities
                SET year = TO_CHAR(NEW.crash_date,'yyyy')
                WHERE crash_id = NEW.crash_id;
        END IF;
        -- if any of the location columns were updated then update the location column in the fatalities table
        IF (NEW.rpt_block_num IS DISTINCT FROM OLD.rpt_block_num
        OR NEW.rpt_street_pfx IS DISTINCT FROM OLD.rpt_street_pfx
        OR NEW.rpt_street_name IS DISTINCT FROM OLD.rpt_street_name
        OR NEW.rpt_sec_block_num IS DISTINCT FROM OLD.rpt_sec_block_num
        OR NEW.rpt_sec_street_pfx IS DISTINCT FROM OLD.rpt_sec_street_pfx
        OR NEW.rpt_sec_street_name IS DISTINCT FROM OLD.rpt_sec_street_name) THEN
            UPDATE fatalities
                SET location = CONCAT_WS(' ', NEW.rpt_block_num, NEW.rpt_street_pfx, NEW.rpt_street_name, '(', NEW.rpt_sec_block_num, NEW.rpt_sec_street_pfx, NEW.rpt_sec_street_name, ')')
                WHERE crash_id = NEW.crash_id;
        END IF;
    RETURN NEW;
    END
$function$
;
