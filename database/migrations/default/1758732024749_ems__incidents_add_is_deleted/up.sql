-- Add is_deleted col for soft deletions
alter table "public"."ems__incidents" add column "is_deleted" bool
 not null default 'false';
