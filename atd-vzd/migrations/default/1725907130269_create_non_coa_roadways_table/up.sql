create table public.non_coa_roadways (
id serial primary key,
geometry public.geometry(MultiPolygon,4326) not null,
created_at timestamptz DEFAULT now() not null);

comment on table public.non_coa_roadways is 'Polygon layer which represents roadways that are not maintained by the City of Austin';
