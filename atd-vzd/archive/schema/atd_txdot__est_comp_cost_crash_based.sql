-- Create a new table to house crash based comprehensive cost values, styled after atd_txdot__est_comp_cost
CREATE TABLE atd_txdot__est_comp_cost_crash_based(
  est_comp_cost_id serial primary key,
  est_comp_cost_desc character varying,
  est_comp_cost_amount numeric(10,2)
  );

-- Populate new crash based comprehensive cost table
INSERT INTO atd_txdot__est_comp_cost_crash_based (est_comp_cost_id, est_comp_cost_desc, est_comp_cost_amount) values (1, 'Killed (K)', 3000000);
INSERT INTO atd_txdot__est_comp_cost_crash_based (est_comp_cost_id, est_comp_cost_desc, est_comp_cost_amount) values (2, 'Suspected Serious Injury (A)', 2500000);
INSERT INTO atd_txdot__est_comp_cost_crash_based (est_comp_cost_id, est_comp_cost_desc, est_comp_cost_amount) values (3, 'Non-incapacitating Injury (B)', 270000);
INSERT INTO atd_txdot__est_comp_cost_crash_based (est_comp_cost_id, est_comp_cost_desc, est_comp_cost_amount) values (4, 'Possible Injury (C)', 220000);
INSERT INTO atd_txdot__est_comp_cost_crash_based (est_comp_cost_id, est_comp_cost_desc, est_comp_cost_amount) values (5, 'Not Injured', 50000);
INSERT INTO atd_txdot__est_comp_cost_crash_based (est_comp_cost_id, est_comp_cost_desc, est_comp_cost_amount) values (6, 'Unknown Injury (0)', 50000);
INSERT INTO atd_txdot__est_comp_cost_crash_based (est_comp_cost_id, est_comp_cost_desc, est_comp_cost_amount) values (7, 'Non-CR3', 10000);