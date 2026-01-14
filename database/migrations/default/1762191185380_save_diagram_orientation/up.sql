-- Add diagram_transform col to save CR3 diagram zoom, orientation and x/y position
alter table "public"."crashes" add column "diagram_transform" jsonb;
