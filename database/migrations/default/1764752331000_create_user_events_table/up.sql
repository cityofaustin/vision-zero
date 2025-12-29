-- Create user_events table for activity logging
CREATE TABLE IF NOT EXISTS public.user_events (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    event_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on event_name for faster queries by event type
CREATE INDEX IF NOT EXISTS idx_user_events_event_name ON public.user_events(event_name);

-- Add comment to table
COMMENT ON TABLE public.user_events IS 'Stores user activity events for analytics and user behavior tracking';


