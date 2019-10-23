create function atd_txdot_crashes_updates_audit_log() returns trigger
    language plpgsql
as
$$
DECLARE
    estCompCostList decimal(10,2)[];
    estCompEconList decimal(10,2)[];
BEGIN
    ------------------------------------------------------------------------------------------
    -- CHANGE-LOG OPERATIONS
    ------------------------------------------------------------------------------------------
    -- Stores a copy of the current record into the change log
    IF  (TG_OP = 'UPDATE') then
        INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
        VALUES (old.crash_id, old.crash_id, 'crashes', row_to_json(old));
    END IF;

    ------------------------------------------------------------------------------------------
    -- LATITUDE / LONGITUDE OPERATIONS
    ------------------------------------------------------------------------------------------

    -- When CRIS is present, populate values to Primary column
    -- NOTE: It will update primary only if there is no lat/long data in the geo-coded or primary columns.
    -- If there is data in primary coordinates, then it will not do anything.
    -- If the there is geocoded data, it will not do anything.
    IF (
        (NEW.latitude is not null AND NEW.longitude is not null)
        AND (NEW.latitude_geocoded is null AND NEW.longitude_geocoded is null)
        AND (NEW.latitude_primary is null AND NEW.longitude_primary is null)
    ) THEN
        NEW.latitude_primary = NEW.latitude;
        NEW.longitude_primary = NEW.longitude;
    END IF;

    -- When GeoCoded lat/longs are present, populate value to Primary
    -- NOTE: It will only update if there are geocoded lat/longs and there are no primary lat/longs
    IF (
        (NEW.latitude_geocoded is not null AND NEW.longitude_geocoded is not null)
        AND (NEW.latitude_primary is null AND NEW.longitude_primary is null)
    ) THEN
        NEW.latitude_primary = NEW.latitude_geocoded;
        NEW.longitude_primary = NEW.longitude_geocoded;
    END IF;
    -- Finally we update the position field
    IF (NEW.longitude_primary is not null AND NEW.latitude_primary is not null) THEN
        NEW.position = ST_MakePoint(NEW.longitude_primary, NEW.latitude_primary);
    END IF;
    --- END OF LAT/LONG OPERATIONS ---


	------------------------------------------------------------------------------------------
    -- CONFIRMED ADDRESSES
    ------------------------------------------------------------------------------------------

    -- If there is no confirmed primary address provided, then generate it:
    IF (NEW.address_confirmed_primary IS NULL) THEN
    	NEW.address_confirmed_primary 	= TRIM(CONCAT(NEW.rpt_street_pfx, ' ', NEW.rpt_block_num, ' ', NEW.rpt_street_name, ' ', NEW.rpt_street_sfx));
    END IF;
    -- If there is no confirmed secondary address provided, then generate it:
    IF (NEW.address_confirmed_secondary IS NULL) THEN
		NEW.address_confirmed_secondary = TRIM(CONCAT(NEW.rpt_sec_street_pfx, ' ', NEW.rpt_sec_block_num, ' ', NEW.rpt_sec_street_name, ' ', NEW.rpt_sec_street_sfx));
    END IF;
    --- END OF ADDRESS OPERATIONS ---

    ------------------------------------------------------------------------------------------
    -- APD's Death Count
    ------------------------------------------------------------------------------------------
    -- If our apd death count is null, then assume death_cnt's value
    IF (NEW.apd_confirmed_death_count IS NULL) THEN
        NEW.apd_confirmed_death_count = NEW.death_cnt;
    -- Otherwise, the value has been entered manually, signal change with confirmed as 'Y'
    ELSE
        NEW.apd_confirmed_fatality = 'Y';
    END IF;
    -- END OF APD's DEATH COUNT

    ------------------------------------------------------------------------------------------
    -- ESTIMATED COSTS
    ------------------------------------------------------------------------------------------

    -- First we need to gather a list of all of our costs, comprehensive and economic.
    estCompCostList = ARRAY(SELECT est_comp_cost_amount FROM atd_txdot__est_comp_cost ORDER BY est_comp_cost_id ASC);
    estCompEconList = ARRAY(SELECT est_econ_cost_amount FROM atd_txdot__est_econ_cost ORDER BY est_econ_cost_id ASC);

    NEW.est_comp_cost = (0
       + (NEW.apd_confirmed_death_count * (estCompCostList[2]))
       + (NEW.sus_serious_injry_cnt * (estCompCostList[3]))
       + (NEW.nonincap_injry_cnt * (estCompCostList[4]))
       + (NEW.poss_injry_cnt * (estCompCostList[5]))
       + (NEW.non_injry_cnt * (estCompCostList[6]))
   )::decimal(10,2);

    NEW.est_econ_cost = (0
       + (NEW.apd_confirmed_death_count * (estCompEconList[2]))
       + (NEW.sus_serious_injry_cnt * (estCompEconList[3]))
       + (NEW.nonincap_injry_cnt * (estCompEconList[4]))
       + (NEW.poss_injry_cnt * (estCompEconList[5]))
       + (NEW.non_injry_cnt * (estCompEconList[6]))
   )::decimal(10,2);

    --- END OF COST OPERATIONS ---

    -- Record the current timestamp
    NEW.last_update = current_timestamp;
    RETURN NEW;
END;
$$;

alter function atd_txdot_crashes_updates_audit_log() owner to atd_vz_data;

