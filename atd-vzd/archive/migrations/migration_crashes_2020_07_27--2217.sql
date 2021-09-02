ALTER TABLE "public"."atd_txdot_crashes" ADD COLUMN "temp_record" bool DEFAULT 'FALSE';

-- Creates an index for the column for faster sorting
create index atd_txdot_crashes_temp_record_index
	on atd_txdot_crashes (temp_record);
