drop trigger is exists set_updated_at_engineering_areas;
alter table engineering_areas drop column created_at;
alter table engineering_areas alter column updated_at set data type timestamp using updated_at::timestamp;
alter table engineering_areas rename column engineering_area_id to area_id;
alter table engineering_areas rename column atd_engineer_areas to label;
