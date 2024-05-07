--
-- handle a charges record insert by setting
-- the person_id column based on the crash_id and unit_nbr and prsn_nbr
--
create or replace function public.charges_cris_set_person_id()
returns trigger
language plpgsql
as $$
DECLARE
   person_record record;
BEGIN
    SELECT INTO person_record *
        FROM public.people_cris where crash_id = new.crash_id and unit_nbr = new.unit_nbr and prsn_nbr = new.prsn_nbr;
    new.person_id = person_record.id;
    RETURN new;
END;
$$;

create trigger set_charges_cris_person_id
before insert on public.charges_cris
for each row
execute procedure public.charges_cris_set_person_id();

