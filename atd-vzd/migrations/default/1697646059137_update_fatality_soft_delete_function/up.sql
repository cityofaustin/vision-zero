CREATE OR REPLACE FUNCTION public.update_fatality_soft_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
        -- if updated table was primary person
    	IF (TG_TABLE_NAME = 'atd_txdot_primaryperson') THEN
            -- if injury is updated to fatal
        	IF (NEW.prsn_injry_sev_id = 4) THEN
                -- insert into fatalities if record doesn't exist or update existing record to undo soft-delete
                INSERT INTO fatalities (crash_id, primaryperson_id)
                VALUES (NEW.crash_id, NEW.primaryperson_id)
                ON CONFLICT (primaryperson_id)
                DO UPDATE SET is_deleted = false;
            -- if injury is updated to non-fatal and record exists in fatalities then soft-delete
            ELSE
                UPDATE fatalities f
                SET is_deleted = true
                WHERE (f.primaryperson_id = NEW.primaryperson_id);
            END IF;
        -- else if table was person then do the same thing ^
        ELSIF (TG_TABLE_NAME = 'atd_txdot_person') THEN
            IF (NEW.prsn_injry_sev_id = 4) THEN
                INSERT INTO fatalities (crash_id, person_id)
                VALUES (NEW.crash_id, NEW.person_id)
                ON CONFLICT (person_id)
                DO UPDATE SET is_deleted = false;
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
