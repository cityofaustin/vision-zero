-- Drop existing years_of_life_lost columns which were 0 for all rows
-- Replace with generated field calculated from prsn_age column if
-- prsn_injry_sev_id = 4 (fatality) otherwise set as 0

-- Name: atd_txdot_person; Type: TABLE; Schema: public; Owner: atd_vz_data
--

ALTER TABLE atd_txdot_person DROP COLUMN years_of_life_lost;

ALTER TABLE atd_txdot_person
ADD COLUMN years_of_life_lost integer
GENERATED ALWAYS AS (
    CASE WHEN prsn_injry_sev_id = 4 
    THEN (GREATEST(75 - prsn_age, 0)) 
    ELSE 0 
    END
) 
STORED;

-- Name: atd_txdot_primaryperson; Type: TABLE; Schema: public; Owner: atd_vz_data
--

ALTER TABLE atd_txdot_primaryperson DROP COLUMN years_of_life_lost;

ALTER TABLE atd_txdot_primaryperson
ADD COLUMN years_of_life_lost integer
GENERATED ALWAYS AS (
    CASE WHEN prsn_injry_sev_id = 4 
    THEN (GREATEST(75 - prsn_age, 0)) 
    ELSE 0 
    END
) 
STORED;
