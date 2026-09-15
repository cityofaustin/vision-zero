CREATE TABLE "lookups"."geolocation_provider" ("id" serial NOT NULL, "label" text NOT NULL, "source" text NOT NULL DEFAULT 'vz', PRIMARY KEY ("id") , UNIQUE ("id"));

INSERT INTO "lookups"."geolocation_provider"("id", "label", "source") VALUES (1, E'cris', E'vz');

INSERT INTO "lookups"."geolocation_provider"("id", "label", "source") VALUES (2, E'apd_cad', E'vz');

INSERT INTO "lookups"."geolocation_provider"("id", "label", "source") VALUES (3, E'manual_qa', E'vz');

alter table "public"."crashes" add column "geolocation_provider_id" integer
 not null default '1';

alter table "public"."crashes"
  add constraint "crashes_geolocation_provider_id_fkey"
  foreign key ("geolocation_provider_id")
  references "lookups"."geolocation_provider"
  ("id") on update cascade on delete restrict;
