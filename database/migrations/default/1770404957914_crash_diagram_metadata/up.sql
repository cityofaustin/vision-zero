alter table crashes_cris add column diagram_s3_object_key text;
alter table crashes add column diagram_s3_object_key text;

-- todo: this needs to be a backfill op
-- update crashes set
--     diagram_s3_object_key
--     = 'prod/cr3s/crash_diagrams/' || crashes.record_locator::text || '.jpeg'
-- where cr3_stored_fl is true;
