-- Create additional indexes for the locations table

create index atd_txdot_locations_level_1_index
    on atd_txdot_locations (level_1);

create index atd_txdot_locations_level_2_index
    on atd_txdot_locations (level_2);

create index atd_txdot_locations_level_3_index
    on atd_txdot_locations (level_3);

create index atd_txdot_locations_level_4_index
    on atd_txdot_locations (level_4);

create index atd_txdot_locations_level_5_index
    on atd_txdot_locations (level_5);

