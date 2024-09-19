alter table public.crash_notes add column is_deleted bool
 not null default false;
