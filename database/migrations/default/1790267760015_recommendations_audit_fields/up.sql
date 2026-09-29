alter table "public"."recommendations" add column "updated_at" timestamptz
 not null default now();
alter table "public"."recommendations" add column "updated_by" text null ;

-- Backfill updated_at with created_at value
UPDATE "public"."recommendations" 
SET "updated_at" = "created_at";

-- Backfill updated_by with created_by value
UPDATE "public"."recommendations" 
SET "updated_by" = "created_by";

-- Make the column non-nullable
ALTER TABLE "public"."recommendations" 
ALTER COLUMN "updated_by" SET NOT NULL;

create trigger set_recommendation_updated_at before update on "public"."recommendations" for each row execute function public.set_updated_at_timestamp();
