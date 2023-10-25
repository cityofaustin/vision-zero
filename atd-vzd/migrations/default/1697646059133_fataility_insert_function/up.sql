CREATE OR REPLACE FUNCTION public.fatality_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
ldm_person_id INTEGER;
    BEGIN
    	IF (TG_TABLE_NAME = 'atd_txdot_primaryperson') THEN
    	    INSERT INTO fatalities (crash_id, primaryperson_id)
    		    VALUES (NEW.crash_id, NEW.primaryperson_id);
    	ELSIF (TG_TABLE_NAME = 'atd_txdot_person') THEN
			   
        --SELECT some_column INTO new_value
        --FROM some_table
        --WHERE some_condition = NEW.some_attribute;

        --INSERT INTO fatalities (crash_id, person_id)
            --VALUES (NEW.crash_id, new_value);

    		INSERT INTO fatalities (crash_id, person_id)
    		    VALUES (NEW.crash_id, NEW.person_id);
    	END IF;
    	RETURN NEW;
    END
$function$
;
