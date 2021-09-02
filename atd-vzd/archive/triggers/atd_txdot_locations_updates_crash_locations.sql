create function atd_txdot_locations_updates_crash_locations() returns trigger
    language plpgsql
as
$$
BEGIN
    UPDATE atd_txdot_crash_locations
        SET location_id = NEW.location_id
    WHERE crash_id IN (SELECT crash_id FROM search_atd_location_crashes(NEW.location_id));

    RETURN NEW;
END;
$$;

alter function atd_txdot_locations_updates_crash_locations() owner to atd_vz_data;

