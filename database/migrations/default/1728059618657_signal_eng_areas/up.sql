alter table non_coa_roadways drop column id;

create table public.signal_engineer_areas (
    signal_engineer_area_id integer unique not null,
    signal_eng_area text not null,
    geometry public.geometry (multipolygon, 4326) not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

comment on table public.non_coa_roadways is 'Polygon zones assigned to traffic signal engineers. These zones cover the Full and Limited Purpose juristdiction areas of the City of Austin.';

create or replace trigger set_updated_at_signal_engineer_areas
before update on public.signal_engineer_areas
for each row execute function set_updated_at_timestamp();
