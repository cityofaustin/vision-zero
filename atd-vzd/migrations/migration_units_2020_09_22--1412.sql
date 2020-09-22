-- Adds new CRIS columns for the units table

alter table atd_txdot_units add veh_damage_description1_id int default NULL;
alter table atd_txdot_units add veh_damage_severity1_id int default NULL;
alter table atd_txdot_units add veh_damage_direction_of_force1_id int default NULL;
alter table atd_txdot_units add veh_damage_description2_id int default NULL;
alter table atd_txdot_units add veh_damage_severity2_id int default NULL;
alter table atd_txdot_units add veh_damage_direction_of_force2_id int default NULL;
