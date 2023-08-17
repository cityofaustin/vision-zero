-- Function for insert and update triggers on atd_apd_blueform
CREATE OR REPLACE FUNCTION update_noncr3_location()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
DECLARE 
    found_location_id varchar;

BEGIN
    -- Check if crash is on a major road and of concern to TxDOT.
    -- NEW.position is recalculated in a trigger called 
    -- atd_txdot_blueform_update_position which runs before this trigger.
    IF EXISTS (SELECT ncr3m.*
                FROM non_cr3_mainlanes AS ncr3m WHERE (
                            (NEW.position && ncr3m.geometry)
                            AND ST_Contains(
                                ST_Transform(
                                        ST_Buffer(
                                            ST_Transform(ncr3m.geometry, 2277),
                                            1,
                                            'endcap=flat join=round'
                                        ),
                                        4326
                                ), /* transform into 2277 to buffer by a foot, not a degree */
                                NEW.position
                            )
                    )) THEN
        -- If it is, then set the location_id to None
        NEW.location_id = NULL;
    ELSE 
        -- If it isn't on a major road and is of concern to Vision Zero, try to find a location_id for it.
        SELECT location_id INTO found_location_id FROM atd_txdot_locations AS atl
                                 WHERE ( atl.location_group = 1
                                     AND (atl.shape && NEW.position)
                                     AND ST_Contains(atl.shape, NEW.position)
                                     );

        -- If a location is found, update the record.
        IF found_location_id IS NOT NULL THEN
            NEW.location_id = found_location_id;
        END IF;
    END IF;

	RETURN NEW;
END;
$$
