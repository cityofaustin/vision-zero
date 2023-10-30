create trigger atd_txdot_person_audit_log before
update
    on
    public.atd_txdot_person for each row execute function atd_txdot_person_updates_audit_log()
