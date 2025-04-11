drop trigger if exists remove_dupe_non_cr3s_insert_update_trigger on atd_apd_blueform;
drop function if exists remove_dupe_non_cr3s;

alter table ems__incidents drop column atd_apd_blueform_case_id;
alter table atd_apd_blueform drop column is_deleted;
drop index crashes_case_id_idx;
