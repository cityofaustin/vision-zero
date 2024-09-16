create table movement_direction_corrections (
  id serial primary key,
  potential boolean not null default false,
  found boolean not null default false,
  crash_id integer,
  unit_id integer,
  field character varying,
  value integer,
  geometry geometry(POINT, 4326),
  cardinal_direction boolean not null default false,
  k boolean not null default false,
  a boolean not null default false,
  b boolean not null default false,
  manual_qa boolean not null default false);