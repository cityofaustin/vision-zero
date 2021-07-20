-- Add a new column to the atd_txdot_crashes table to hold crash basaed comprehensive cost
ALTER TABLE atd_txdot_crashes ADD COLUMN est_comp_cost_crash_based numeric(10,2) default 0;
