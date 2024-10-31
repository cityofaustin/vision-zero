alter table non_coa_roadways drop column id;

create table public.signal_engineer_areas (
    signal_engineer_area_id integer unique not null,
    signal_eng_area text not null,
    geometry public.geometry (multipolygon, 4326) not null,
    created_at timestamptz default now() not null
);

create index on signal_engineer_areas using gist (geometry);

comment on table public.signal_engineer_areas is 'Polygon zones assigned to traffic signal engineers. These zones cover the Full and Limited Purpose juristdiction areas of the City of Austin.';
