CREATE OR REPLACE FUNCTION cris_facts.maintain_vz_schema_person_records()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO vz_facts.atd_txdot_person (crash_id, unit_nbr, prsn_nbr) VALUES (NEW.crash_id, NEW.unit_nbr, NEW.prsn_nbr);
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM vz_facts.atd_txdot_person WHERE crash_id = OLD.crash_id and unit_nbr = OLD.unit_nbr and prsn_nbr = OLD.prsn_nbr;
  END IF;
  RETURN NULL;
END;
$function$
;
