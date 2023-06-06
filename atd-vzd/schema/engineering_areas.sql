CREATE TABLE public.engineering_areas(
    id integer NOT NULL,
    eng_area_label text,
    eng_area_geometry geometry
);

CREATE SEQUENCE public.engineering_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.engineering_areas
    ADD CONSTRAINT engineering_areas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.engineering_areas ALTER COLUMN id SET DEFAULT nextval('public.engineering_areas_id_seq'::regclass);
