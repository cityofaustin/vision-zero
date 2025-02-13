alter table "public"."location_notes" add column "is_deleted" bool
 not null default 'false';
