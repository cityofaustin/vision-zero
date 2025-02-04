-- use replica mode to disable triggers
set session_replication_role = replica;

--
-- update crash notes
--
alter table crash_notes add column created_by text, add updated_by text;

update crash_notes set created_by = user_email, updated_by = user_email;

--
-- update location_notes
--
alter table location_notes add column created_by text, add updated_by text;

update location_notes set created_by = user_email, updated_by = user_email;

-- reset the session replication role, even though the session is about to end :)
set session_replication_role = default;
