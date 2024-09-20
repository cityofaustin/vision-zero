drop index if exists crashes_position_idx;
create index crashes_position_idx on public.crashes using GIST (position);
