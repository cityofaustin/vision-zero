create trigger atd_txdot_person_fatal_insert after
insert
    on
    vz_facts.atd_txdot_person for each row
    when (
        (
            new.prsn_injry_sev_id = 4
        )
    ) execute function fatality_insert();

create trigger atd_txdot_person_fatal_insert after
insert
    on
    cris_facts.atd_txdot_person for each row
    when (
        (
            new.prsn_injry_sev_id = 4
        )
    ) execute function fatality_insert();
