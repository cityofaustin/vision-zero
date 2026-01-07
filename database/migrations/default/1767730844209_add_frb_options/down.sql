-- Delete the new status options
DELETE FROM public.atd__recommendation_status_lkp WHERE id IN (6, 7);

-- Remove the sort_order column
ALTER TABLE public.atd__recommendation_status_lkp 
DROP COLUMN sort_order;

-- Note: Cannot undo dropping the sequence in the down migration
-- The sequence was intentionally removed since lookup tables don't need auto-increment

