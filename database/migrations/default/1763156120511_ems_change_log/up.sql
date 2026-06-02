CREATE TABLE public.change_log_ems__incidents (
    id serial NOT NULL,
    record_id integer NOT NULL,
    operation_type text NOT NULL,
    record_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by text NOT NULL
);

CREATE TRIGGER insert_change_log_ems__incidents AFTER INSERT OR UPDATE ON public.ems__incidents FOR EACH ROW EXECUTE FUNCTION public.insert_change_log();

CREATE INDEX change_log_ems__incidents_record_id_idx ON public.change_log_ems__incidents USING btree (record_id);
