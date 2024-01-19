-- Add new trauma center fields from CRIS to the crashes table
ALTER TABLE public.atd_txdot_crashes
ADD COLUMN near_trauma_center_id integer NULL,
ADD COLUMN near_trauma_center_distance double precision NULL;
