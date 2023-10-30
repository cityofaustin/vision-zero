CREATE OR REPLACE FUNCTION public.update_fatality_soft_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cris_id integer; -- used to hold vz id when triggered from cris_facts schema
    injury_severity_id integer;
    BEGIN
    RAISE NOTICE 'Here we are.';
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
        ELSIF (TG_TABLE_NAME = 'atd_txdot_person' and TG_TABLE_SCHEMA = 'cris_facts') THEN
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
        ELSIF (TG_TABLE_NAME = 'atd_txdot_person' and TG_TABLE_SCHEMA = 'vz_facts') THEN
            RAISE NOTICE 'The value of NEW.person_id is %', NEW.person_id;
            SELECT cris_person_id, prsn_injry_sev_id INTO cris_id, injury_severity_id FROM public.atd_txdot_person WHERE vz_person_id = NEW.person_id;
            RAISE NOTICE 'The value of cris_id is %', cris_id;
            RAISE NOTICE 'The value of prsn_injry_sev_id is %', injury_severity_id;

            IF (NEW.prsn_injry_sev_id = 4) THEN
                RAISE NOTICE 'we are in the insert branch';
                INSERT INTO fatalities (crash_id, person_id)
                VALUES (NEW.crash_id, NEW.person_id)
                ON CONFLICT (person_id)
                DO UPDATE SET is_deleted = false;
            ELSE
                RAISE NOTICE 'we are in the update branch';
                UPDATE fatalities f
                SET is_deleted = true
                WHERE (f.person_id = NEW.person_id);
            END IF;
        END IF;
        RETURN NEW;
    END
$function$
;
