-- Rename the column crash_id to case_id
alter table atd_apd_blueform rename column crash_id to case_id;

-- Rename the index atd_apd_blueform_call_num_index
drop index atd_apd_blueform_call_num_index;

-- Create a new index with a new column
create index atd_apd_blueform_case_id_index
    on atd_apd_blueform (case_id);
