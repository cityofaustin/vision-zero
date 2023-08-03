-- Function for atd_apd_blueform generated column called location_id
CREATE OR REPLACE FUNCTION update_noncr3_location(blueform_case_id integer)
  RETURNS varchar 
  LANGUAGE PLPGSQL
  IMMUTABLE
  AS
$$
BEGIN
    -- Check if crash is main-lane and of concern to TxDOT
	IF EXISTS (SELECT atc.*
                FROM atd_apd_blueform AS atc
                INNER JOIN non_cr3_mainlanes AS ncr3m ON (
                atc.position && ncr3m.geometry
                AND ST_Contains(
                        ST_Transform(
                                ST_Buffer(
                                    ST_Transform(ncr3m.geometry, 2277),
                                    1,
                                    'endcap=flat join=round'
                                ),
                                4326
                        ), /* transform into 2277 to buffer by a foot, not a degree */
                        atc.position
                    )
                )
                WHERE atc.case_id = blueform_case_id) THEN
        -- If it is, then set the location_id to None
		RETURN NULL;
    ELSE 
        -- If it isn't main-lane and of concern to Vision Zero, try to find a location_id for it
        RETURN (SELECT aab.location_id FROM atd_apd_blueform AS aab
                INNER JOIN atd_txdot_locations AS atl
                ON ( 1=1
                    AND atl.location_group = 1
                    AND (atl.shape && aab.position)
                    AND ST_Contains(atl.shape, aab.position)
                    )
                WHERE 1=1
                AND aab.case_id = blueform_case_id);
    END IF;
END;
$$
