ALTER TABLE "public"."recommendations" 
DROP COLUMN "updated_by";

DROP TRIGGER IF EXISTS set_recommendation_updated_at ON "public"."recommendations";

ALTER TABLE "public"."recommendations" 
DROP COLUMN "updated_at";
