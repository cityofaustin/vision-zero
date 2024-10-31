-- remove serial id col
alter table council_districts drop column id;
-- make council_district col the primary key
alter table council_districts
add constraint council_districts_pkey primary key (council_district);
-- add foreign key constraint to existing crashes column
alter table crashes add constraint crashes_council_district_fkey
foreign key (council_district) references council_districts (
    council_district
) on update cascade on delete set null;

-- convert updated_at from timestamp to timestamp with time zone and rename
alter table council_districts alter column updated_at set data type timestamptz using updated_at::timestamptz;
alter table council_districts rename column updated_at to created_at;
