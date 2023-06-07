CREATE TABLE public.engineering_areas(
    area_id integer,
    label text NOT NULL,
    geometry geometry(MultiPolygon, 4326) NOT NULL
);

ALTER TABLE ONLY public.engineering_areas
    ADD CONSTRAINT engineering_areas_pkey PRIMARY KEY (area_id);

CREATE UNIQUE INDEX engineering_areas_label_key ON public.engineering_areas USING btree (label);

CREATE INDEX engineering_areas_gix
ON engineering_areas
USING GIST (geometry);
