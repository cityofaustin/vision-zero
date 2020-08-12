-- First create another column
alter table atd_apd_blueform
	add position geometry(Geometry,4326);

-- Create blueform position index using GIST
create index atd_apd_blueform_position_index
	on atd_apd_blueform USING GIST (position);

-- Populate the value for the column
UPDATE atd_apd_blueform
SET position = ST_SetSRID(ST_Point(longitude, latitude), 4326)
WHERE position is null;

-- Create the trigger for blueform to cover new values
CREATE TRIGGER atd_txdot_blueform_update_position
   BEFORE INSERT OR UPDATE
   ON atd_apd_blueform
   FOR EACH ROW
       EXECUTE PROCEDURE atd_txdot_blueform_update_position();
