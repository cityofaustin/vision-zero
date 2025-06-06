drop trigger if exists non_cr3_insert_ems_match_trigger on atd_apd_blueform;

drop trigger if exists non_cr3_update_ems_match_trigger on atd_apd_blueform;

drop function public.update_noncr3_ems_match;

alter table ems__incidents
    drop column non_cr3_match_status,
    drop column matched_non_cr3_case_ids;
