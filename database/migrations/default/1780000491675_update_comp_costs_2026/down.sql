ALTER TABLE people ALTER COLUMN est_comp_cost_crash_based SET EXPRESSION AS (CASE
WHEN prsn_injry_sev_id = 1 THEN 3000000
WHEN prsn_injry_sev_id = 2 THEN 250000
WHEN prsn_injry_sev_id = 3 THEN 200000
WHEN prsn_injry_sev_id = 4 THEN 3500000
ELSE 20000
END)
