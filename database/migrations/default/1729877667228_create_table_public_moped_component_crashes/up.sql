CREATE TABLE "public"."moped_component_crashes" ("crash_pk" integer NOT NULL, "mopd_proj_component_id" integer NOT NULL, PRIMARY KEY ("crash_pk","mopd_proj_component_id") , FOREIGN KEY ("crash_pk") REFERENCES "public"."crashes"("id") ON UPDATE cascade ON DELETE cascade);

comment on table "public"."moped_component_crashes" is E'This table enables crashes to be linked with their associated moped project components.';
