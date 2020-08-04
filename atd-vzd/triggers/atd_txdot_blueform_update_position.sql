CREATE FUNCTION atd_txdot_blueform_update_position() RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
   NEW.position = ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326);
   RETURN NEW;
END;
$$;

ALTER FUNCTION atd_txdot_blueform_update_position() owner to atd_vz_data;