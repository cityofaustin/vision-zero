-- This function soft-deletes a fatality if the injury severity is changed from a 4 (killed).
-- It undoes the soft-delete if it is changed back to 4. If it is a person record that
-- doesn't yet exist in the fatalities table and the injury severity is changed to 4 then
-- it will insert a new record into the fatalities table.
CREATE OR REPLACE FUNCTION update_fatality_soft_delete()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $function$
    BEGIN
        -- if updated table was primary person
    	IF (TG_TABLE_NAME = 'atd_txdot_primaryperson') THEN
            -- if injury is updated to fatal
        	IF (NEW.prsn_injry_sev_id = 4) THEN
                -- if the fatality already exists then undo the soft-delete
        	    IF (EXISTS (SELECT FROM fatalities WHERE primaryperson_id = NEW.primaryperson_id)) THEN
                    UPDATE fatalities f
                    SET is_deleted = false
                    WHERE (f.primaryperson_id = NEW.primaryperson_id);
                -- if the fatality doesnt exist yet add it to the table
                ELSE
                    INSERT INTO fatalities (crash_id, primaryperson_id)
    		        VALUES (NEW.crash_id, NEW.primaryperson_id);
    		    END IF;
            -- if injury is updated to non-fatal and record exists in fatalities then soft-delete
            ELSE
                UPDATE fatalities f
                SET is_deleted = true
                WHERE (f.primaryperson_id = NEW.primaryperson_id);
            END IF;
        -- else if table was person then do the same thing
        ELSIF (TG_TABLE_NAME = 'atd_txdot_person') THEN
            IF (NEW.prsn_injry_sev_id = 4) THEN
                IF (EXISTS (SELECT FROM fatalities WHERE person_id = NEW.person_id)) THEN
                    UPDATE fatalities f
                    SET is_deleted = false
                    WHERE (f.person_id = NEW.person_id);
                ELSE
                    INSERT INTO fatalities (crash_id, person_id)
    		        VALUES (NEW.crash_id, NEW.person_id);
    		    END IF;
            ELSE
                UPDATE fatalities f
                SET is_deleted = true
                WHERE (f.person_id = NEW.person_id);
            END IF;
        END IF;
        RETURN NEW;
    END
$function$
;
