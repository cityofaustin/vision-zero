-- Name: notes; Type: TABLE; Schema: public; Owner: atd_vz_data
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL,
    text text NOT NULL,
    crash_id integer NOT NULL,
    user_email text
);


--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: atd_vz_data
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.notes_id_seq OWNER TO atd_vz_data;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atd_vz_data
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: atd_vz_data
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);

