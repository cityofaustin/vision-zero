drop index if exists crashes_position_idx;
create index on public.crashes (position);
