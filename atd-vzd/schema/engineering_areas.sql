CREATE TABLE public.engineering_areas(
    area_id integer,
    label text NOT NULL unique,
    geometry geometry(MultiPolygon, 4326) NOT NULL
);

ALTER TABLE ONLY public.engineering_areas
    ADD CONSTRAINT engineering_areas_pkey PRIMARY KEY (area_id);

CREATE INDEX engineering_areas_gix
ON public.engineering_areas
USING GIST (geometry);
