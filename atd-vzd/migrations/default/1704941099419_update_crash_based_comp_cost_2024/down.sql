UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 3000000
WHERE est_comp_cost_desc = 'Killed (K)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 2500000
WHERE est_comp_cost_desc = 'Suspected Serious Injury (A)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 270000
WHERE est_comp_cost_desc = 'Non-incapacitating Injury (B)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 220000
WHERE est_comp_cost_desc = 'Possible Injury (C)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 50000
WHERE est_comp_cost_desc = 'Not Injured';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 50000
WHERE est_comp_cost_desc = 'Unknown Injury (0)';

UPDATE public.atd_txdot__est_comp_cost_crash_based
SET est_comp_cost_amount = 10000
WHERE est_comp_cost_desc = 'Non-CR3';
