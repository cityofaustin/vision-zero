-- Drop existing years_of_life_lost columns which were 0 for all rows
-- Replace with generated field calculated from prsn_age column

-- Name: atd_txdot_person; Type: TABLE; Schema: public; Owner: atd_vz_data
--

ALTER TABLE atd_txdot_person DROP COLUMN years_of_life_lost;

ALTER TABLE atd_txdot_person
ADD COLUMN years_of_life_lost integer
GENERATED ALWAYS AS (GREATEST(75 - prsn_age, 0)) STORED;

-- Name: atd_txdot_primaryperson; Type: TABLE; Schema: public; Owner: atd_vz_data
--

ALTER TABLE atd_txdot_primaryperson DROP COLUMN years_of_life_lost;

ALTER TABLE atd_txdot_primaryperson
ADD COLUMN years_of_life_lost integer
GENERATED ALWAYS AS (GREATEST(75 - prsn_age, 0)) STORED;