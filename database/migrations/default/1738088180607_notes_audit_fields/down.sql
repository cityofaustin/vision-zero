-- use replica mode to disable triggers
set session_replication_role = replica;

--
-- revert crash notes
--
alter table crash_notes
drop column created_by,
drop column updated_by;

--
-- revert location notes
--
alter table location_notes
drop column created_by,
drop column updated_by;

-- reset the session replication role, even though the session is about to end :)
set session_replication_role = default;
