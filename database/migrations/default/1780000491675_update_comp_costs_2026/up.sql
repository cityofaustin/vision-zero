ALTER TABLE people ALTER COLUMN est_comp_cost_crash_based SET EXPRESSION AS (CASE
WHEN prsn_injry_sev_id = 1 THEN 3700000 -- SUSPECTED SERIOUS INJURY
WHEN prsn_injry_sev_id = 2 THEN 250000 -- NON-INCAPACITATING INJURY / SUSPECTED MINOR INJURY
WHEN prsn_injry_sev_id = 3 THEN 200000 -- POSSIBLE INJURY
WHEN prsn_injry_sev_id = 4 THEN 4500000 -- KILLED/FATAL
ELSE 25000 -- NOT INJURED, UNKNOWN, AUTONOMOUS AND KILLED (NON-ATD)
end) ;

COMMENT ON COLUMN people.est_comp_cost_crash_based IS
'Generated column of comprehensive costs based on injury severity. Last updated May 2026';
