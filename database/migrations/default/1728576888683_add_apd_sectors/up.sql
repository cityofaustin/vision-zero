create table public.apd_sectors (
    primary_key integer primary key,
    district_name text,
    battalion_code text,
    sector_name text,
    bureau_name text,
    patrol_area text,
    geometry public.geometry (multipolygon, 4326) not null,
    created_at timestamptz default now() not null
);

create index on apd_sectors using gist (geometry);

comment on table public.apd_sectors is 'Polygons which represent Austin Police Department (APD) sectors and districts used for dispatching and reporting';
