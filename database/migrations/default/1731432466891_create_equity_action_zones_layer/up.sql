create table "geo"."equity_action_zones" (
    geoid text primary key,
    indxd_v numeric,
    eaz_type text,
    geometry public.geometry (multipolygon, 4326) not null,
    created_at timestamptz default now() not null
);

create index on "geo"."equity_action_zones" using gist (geometry);

comment on column geo.equity_action_zones.geoid is 'The US census geoid of the census tract that matches this feature';
comment on column geo.equity_action_zones.indxd_v is 'Vulnerability index on a scale of 0-100';
comment on column geo.equity_action_zones.eaz_type is 'Description of the level of vulnerability';
