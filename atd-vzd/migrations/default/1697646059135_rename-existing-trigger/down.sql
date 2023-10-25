-- ALTER TRIGGER trg_10_create_atd_txdot_person ON cris_facts.atd_txdot_person RENAME TO trg_vz_create_atd_txdot_person;
DROP TRIGGER trg_10_create_atd_txdot_person ON cris_facts.atd_txdot_person; 


create trigger trg_vz_create_atd_txdot_person after 
insert or delete on cris_facts.atd_txdot_person 
for each row execute function cris_facts.maintain_vz_schema_person_records();
