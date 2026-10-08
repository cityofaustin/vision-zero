
drop function if exists find_matching_person_ids cascade;
drop function if exists ems_incidents_trigger cascade;
drop function if exists ems_update_incident_crash_pk cascade;
drop function if exists update_crash_ems_match cascade;
drop function if exists ems_update_handle_record_match_event cascade;
drop function if exists update_noncr3_ems_match cascade;
drop function if exists people_dispatch_ems_match cascade;
drop function if exists update_ems_patient_injry_sev cascade;

drop table if exists change_log_ems__incidents;
drop table if exists ems__incidents;
drop table if exists lookups.ems_patient_injry_sev;
