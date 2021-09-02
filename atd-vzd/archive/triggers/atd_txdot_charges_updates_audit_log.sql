create function atd_txdot_charges_updates_audit_log() returns trigger
    language plpgsql
as
$$
BEGIN
    INSERT INTO atd_txdot_change_log (record_id, record_crash_id, record_type, record_json)
    VALUES (old.charge_id, old.crash_id, 'charges', row_to_json(old));

   RETURN NEW;
END;
$$;

alter function atd_txdot_charges_updates_audit_log() owner to atd_vz_data;

