-- rename id and label columns to match AGOL columns
alter table engineering_areas rename column area_id to engineering_area_id;
alter table engineering_areas rename column label to atd_engineer_areas;

-- convert updated_at from timestamp to timestamp with time zone
alter table engineering_areas alter column updated_at set data type timestamptz using updated_at::timestamptz;

-- add created_at column and copy updated_at into it
alter table engineering_areas add column created_at timestamptz default now();
update engineering_areas set created_at = updated_at;

-- set updated_at via trigger
create or replace trigger set_updated_at_engineering_areas
before update on public.engineering_areas
for each row execute function set_updated_at_timestamp();
