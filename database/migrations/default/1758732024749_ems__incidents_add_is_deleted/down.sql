alter table "public"."ems__incidents" drop column "is_deleted";

drop index ems__incidents_is_deleted_index;
