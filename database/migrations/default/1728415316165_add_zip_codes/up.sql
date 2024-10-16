create table public.zip_codes (
    zipcode text primary key,
    geometry public.geometry (multipolygon, 4326) not null,
    created_at timestamptz default now() not null
);

create index on zip_codes using gist (geometry);

comment on table public.zip_codes is 'Polygons which represent the Zone Improvement Plan (ZIP) postal code areas in the Austin metro area.';
