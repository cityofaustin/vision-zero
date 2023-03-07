-- This function is triggered by updates to a crash. If the crash position changes to be outside of Austin Full Purpose,
-- any associated fatalities will be removed from the fatalities table.
-- If the crash position changes to inside AFP and has fatalities associated with it, records will be added to the fatalities table.
-- Changes to the date and location columns will also be reflected in any associated fatality records.
CREATE OR REPLACE FUNCTION update_fatalities_on_crash_update() 
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
    DECLARE
        primary_person record;
        person record;
    BEGIN
        -- check if the position was updated
        IF (OLD.position IS DISTINCT FROM NEW.position) THEN
            -- loop through fatalities in person table if there are any
            FOR person IN (SELECT person_id FROM atd_txdot_person WHERE crash_id = NEW.crash_id AND prsn_injry_sev_id = 4) loop
                -- if person is not in fatalities table but is in austin then add them
                IF (NOT EXISTS (SELECT person_id FROM fatalities WHERE person_id = person.person_id) AND ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    INSERT INTO fatalities (crash_id, person_id, year, location)
                    VALUES (NEW.crash_id, NEW.person_id, TO_CHAR(NEW.crash_date,'yyyy'), CONCAT_WS(' ', NEW.rpt_block_num, NEW.rpt_street_pfx, NEW.rpt_street_name, '(', NEW.rpt_sec_block_num, NEW.rpt_sec_street_pfx, NEW.rpt_sec_street_name, ')'));
                END IF;
                -- if person is in fatalities table but not in austin then remove them
                IF (EXISTS (SELECT person_id FROM fatalities WHERE person_id = person.person_id) AND NOT ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    DELETE FROM fatalities WHERE person_id = person.person_id;
                END IF;
            end loop;
            -- loop through fatalities in primary person table if there are any
            FOR primary_person IN (SELECT primaryperson_id FROM atd_txdot_primaryperson WHERE crash_id = NEW.crash_id AND prsn_injry_sev_id = 4) loop
                -- if person is not in fatalities table but is in austin then add them
                IF (NOT EXISTS (SELECT primaryperson_id FROM fatalities WHERE primaryperson_id = primary_person.primaryperson_id) AND ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    INSERT INTO fatalities (crash_id, primaryperson_id, year, location)
                    VALUES (NEW.crash_id, primary_person.primaryperson_id, TO_CHAR(NEW.crash_date,'yyyy'), CONCAT_WS(' ', NEW.rpt_block_num, NEW.rpt_street_pfx, NEW.rpt_street_name, '(', NEW.rpt_sec_block_num, NEW.rpt_sec_street_pfx, NEW.rpt_sec_street_name, ')'));
                END IF;
                -- if person is in fatalities table but not in austin then remove them
                IF (EXISTS (SELECT primaryperson_id FROM fatalities WHERE primaryperson_id = primary_person.primaryperson_id) AND NOT ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), NEW.position)) THEN
                    DELETE FROM fatalities WHERE primaryperson_id = primary_person.primaryperson_id;
                END IF;
            end loop;
        END IF;
        -- if the crash date was updated then update the year column in the fatalities table
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
