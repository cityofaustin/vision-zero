-- Add sort_order column to atd__recommendation_status_lkp
ALTER TABLE public.atd__recommendation_status_lkp 
ADD COLUMN sort_order integer;

-- Drop the sequence to avoid conflicts with explicit ID inserts
-- Lookup tables don't need auto-increment since values are inserted via migrations
-- CASCADE removes the default value dependency on the id column
DROP SEQUENCE public.atd__recommendation_status_lkp_id_seq CASCADE;

-- Insert new status options: Open - Immediate and Open - Medium Term
INSERT INTO public.atd__recommendation_status_lkp (id, rec_status_desc, sort_order)
VALUES 
  (6, 'Open - Immediate', 1),
  (7, 'Open - Medium Term', 3);

-- Update sort_order for existing records
-- Sort order: 
-- Open - Immediate (1), 
-- Open - Short Term (2), 
-- Open - Medium Term (3),
-- Open - Long Term (4), 
-- Closed - Recommendation Implemented (5), 
-- Closed - No Action Taken (6)
-- Closed - No Action Recommended (7)
UPDATE public.atd__recommendation_status_lkp SET sort_order = 2 WHERE id = 1; -- Open - Short Term
UPDATE public.atd__recommendation_status_lkp SET sort_order = 4 WHERE id = 2; -- Open - Long Term
UPDATE public.atd__recommendation_status_lkp SET sort_order = 5 WHERE id = 4; -- Closed - Recommendation Implemented
UPDATE public.atd__recommendation_status_lkp SET sort_order = 6 WHERE id = 5; -- Closed - No Action Taken
UPDATE public.atd__recommendation_status_lkp SET sort_order = 7 WHERE id = 3; -- Closed - No Action Recommended

