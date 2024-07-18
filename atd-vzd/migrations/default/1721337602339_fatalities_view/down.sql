CREATE TABLE public.fatalities (
    id integer NOT NULL,
    crash_id integer NOT NULL,
    person_id integer,
    primaryperson_id integer,
    is_deleted boolean DEFAULT false NOT NULL,
    updated_by text,
    CONSTRAINT either_primaryperson_or_person CHECK ((((person_id IS NULL) AND (primaryperson_id IS NOT NULL)) OR ((person_id IS NOT NULL) AND (primaryperson_id IS NULL))))
);
CREATE SEQUENCE public.fatalities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.fatalities_id_seq OWNED BY public.fatalities.id;

drop view fatalities_view cascade;