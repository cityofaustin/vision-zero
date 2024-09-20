create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $function$
begin
    new.updated_at := now();
    return new;
end;
$function$;

create trigger set_updated_at_timestamp_crashes_cris
before update on public.crashes_cris
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_crashes_edits
before update on public.crashes_edits
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_crashes
before update on public.crashes
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_units_cris
before update on public.units_cris
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_units_edits
before update on public.units_edits
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_units
before update on public.units
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_people_cris
before update on public.people_cris
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_people_edits
before update on public.people_edits
for each row
execute procedure public.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_people
before update on public.people
for each row
execute procedure public.set_updated_at_timestamp();
