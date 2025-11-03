-- Add diagram_zoom_rotate col to save CR3 diagram zoom and orientation
alter table "public"."crashes" add column "diagram_zoom_rotate" jsonb;
