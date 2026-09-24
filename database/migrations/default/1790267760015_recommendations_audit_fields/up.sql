alter table "public"."recommendations" add column "updated_at" timestamptz
 not null default now();
create trigger set_recommendation_updated_at before update on "public"."recommendations" for each row execute function public.set_updated_at_timestamp();

alter table "public"."recommendations" add column "updated_by" text null ;

-- Backfill updated_by with created_by value
UPDATE "public"."recommendations" 
SET "updated_by" = "created_by" 
WHERE "updated_by" IS NULL;

-- Make the column non-nullable
ALTER TABLE "public"."recommendations" 
ALTER COLUMN "updated_by" SET NOT NULL;
