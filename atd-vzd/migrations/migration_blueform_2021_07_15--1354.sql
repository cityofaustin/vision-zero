-- Add a new column to the atd_apd_blueform table to hold crash based comprehensive cost
ALTER TABLE atd_apd_blueform ADD COLUMN est_comp_cost_crash_based numeric(10,2) default 10000;
