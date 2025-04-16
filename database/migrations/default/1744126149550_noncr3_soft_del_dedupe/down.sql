drop trigger if exists remove_dupe_non_cr3s_insert_update_trigger on atd_apd_blueform;
drop function if exists remove_dupe_non_cr3s;

alter table ems__incidents drop column atd_apd_blueform_case_id;
alter table atd_apd_blueform drop column is_deleted, drop column created_at, drop column updated_at;
create trigger set_public_atd_apd_blueform_updated_at before update on public.atd_apd_blueform for each row execute function public.set_current_timestamp_updated_at();

drop index crashes_case_id_investigat_agency_id_idx;
