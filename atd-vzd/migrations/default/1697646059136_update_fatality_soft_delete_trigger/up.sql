create trigger atd_txdot_person_update_injry after
update
    on
    vz_facts.atd_txdot_person for each row
    when (
        (
            old.prsn_injry_sev_id is distinct
        from
            new.prsn_injry_sev_id
        )
    ) execute function update_fatality_soft_delete()
