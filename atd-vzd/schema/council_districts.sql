CREATE TABLE public.council_districts(
    id integer SERIAL PRIMARY KEY,
    council_district integer NOT NULL unique,
    geometry geometry(MultiPolygon, 4326) NOT NULL
);

CREATE INDEX council_districts_gix
ON public.council_districts
USING GIST (geometry);
