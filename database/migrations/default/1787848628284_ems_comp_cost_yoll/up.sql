--
-- https://github.com/cityofaustin/atd-data-tech/issues/29972=
--
ALTER TABLE ems__incidents
    ADD COLUMN years_of_life_lost bigint GENERATED ALWAYS AS (
        CASE
            WHEN patient_injry_sev_id = 4 THEN GREATEST(75 - pcr_patient_age, 0)
            ELSE 0
        END
    ) STORED,
    ADD COLUMN est_comp_cost_crash_based bigint GENERATED ALWAYS AS (
        CASE
            WHEN patient_injry_sev_id = 1 THEN 3700000  -- SUSPECTED SERIOUS INJURY
            WHEN patient_injry_sev_id = 2 THEN 250000   -- NON-INCAPACITATING INJURY / SUSPECTED MINOR INJURY
            WHEN patient_injry_sev_id = 3 THEN 200000   -- POSSIBLE INJURY
            WHEN patient_injry_sev_id = 4 THEN 4500000  -- KILLED/FATAL
            ELSE 25000                                   -- NOT INJURED, UNKNOWN, AUTONOMOUS AND KILLED (NON-ATD)
        END
    ) STORED;

COMMENT ON COLUMN ems__incidents.years_of_life_lost IS
'Generated column estimating years of potential life lost for fatal patient injuries, calculated as GREATEST(75 - patient age at time of incident, 0). Non-fatal severities are 0. Last updated August 2026';

COMMENT ON COLUMN ems__incidents.est_comp_cost_crash_based IS
'Generated column of comprehensive costs based on injury severity. Last updated August 2026';
