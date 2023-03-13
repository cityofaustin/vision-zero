CREATE OR REPLACE FUNCTION update_fatality_soft_delete()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS $function$
    BEGIN
    	IF (TG_TABLE_NAME = 'atd_txdot_primaryperson') THEN
        	IF (NEW.prsn_injry_sev_id = 4) THEN
        	    IF (EXISTS (SELECT FROM fatalities WHERE primaryperson_id = NEW.primaryperson_id)) THEN
                    UPDATE fatalities f
                    SET is_deleted = false
                    WHERE (f.primaryperson_id = NEW.primaryperson_id);
                ELSE
                    INSERT INTO fatalities (crash_id, primaryperson_id)
    		        VALUES (NEW.crash_id, NEW.primaryperson_id);
    		    END IF;
            ELSE
                UPDATE fatalities f
                SET is_deleted = true
                WHERE (f.primaryperson_id = NEW.primaryperson_id);
            END IF;
        ELSIF (TG_TABLE_NAME = 'atd_txdot_person') THEN
            IF (NEW.prsn_injry_sev_id = 4) THEN
                IF (EXISTS (SELECT FROM fatalities WHERE person_id = NEW.person_id)) THEN
                    UPDATE fatalities f
                    SET is_deleted = false
                    WHERE (f.person_id = NEW.person_id);
                ELSE
                    INSERT INTO fatalities (crash_id, primaryperson_id)
    		        VALUES (NEW.crash_id, NEW.primaryperson_id);
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
