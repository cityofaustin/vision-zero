-- This function determines whether crash occurred on a level 5 road (large highway)
-- and is thus outside of COA jurisdiction.
CREATE OR REPLACE FUNCTION is_crash_level_5(crash_id integer, rpt_road_part_id integer, rpt_hwy_num text) RETURNS boolean AS $$
        BEGIN
        RETURN (
            SELECT(rpt_road_part_id != 2 AND UPPER(LTRIM(rpt_hwy_num)) IN ('35', '183','183A','1','290','71','360','620','45','130'))
            );
        END;
$$ LANGUAGE plpgsql;
