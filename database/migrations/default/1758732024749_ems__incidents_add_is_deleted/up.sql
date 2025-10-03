-- Add is_deleted col for soft deletions
alter table "public"."ems__incidents" add column "is_deleted" bool
 not null default 'false';

create index ems__incidents_is_deleted_index on ems__incidents (
    is_deleted
);
