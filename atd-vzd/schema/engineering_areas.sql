CREATE TABLE public.engineering_areas(
    area_id integer,
    label text,
    geometry geometry
);

ALTER TABLE ONLY public.engineering_areas
    ADD CONSTRAINT engineering_areas_pkey PRIMARY KEY (area_id);

CREATE INDEX engineering_areas_gix
ON engineering_areas
USING GIST (geometry);
