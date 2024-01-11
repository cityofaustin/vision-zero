-- Updating crash based comp costs to reflect new 2024 values
-- as provided by VZ team

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 3500000
WHERE est_comp_cost_desc = 'Killed (K)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 3000000
WHERE est_comp_cost_desc = 'Suspected Serious Injury (A)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 250000
WHERE est_comp_cost_desc = 'Non-incapacitating Injury (B)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 200000
WHERE est_comp_cost_desc = 'Possible Injury (C)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 20000
WHERE est_comp_cost_desc = 'Not Injured';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 20000
WHERE est_comp_cost_desc = 'Unknown Injury (0)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 10000
WHERE est_comp_cost_desc = 'Non-CR3';
