create or replace function public.crashes_cris_set_old_investigator_narrative()
    returns trigger
    language plpgsql
    as $function$
begin
    new.investigator_narrative = old.investigator_narrative;
    return new;
end;
$function$;

create or replace trigger crashes_cris_preserve_investigator_narrative_on_update
before update on public.crashes_cris
for each row
when (
    new.investigator_narrative is null and old.investigator_narrative is not null
)
execute procedure public.crashes_cris_set_old_investigator_narrative();

comment on function public.crashes_cris_set_old_investigator_narrative is 'Sets the
investigator_narrative to its previous value if the updated value is null. This 
trigger function addresses a known CRIS bug in which updated crash records are 
missing the invesitgator narrative. It is tracked via DTS issue 
https://github.com/cityofaustin/atd-data-tech/issues/18971 and CRIS ticket #854366';

--
-- backfill narratives which have been erased
-- run this manually to prevent migration timeout
--

-- update
--     crashes_cris
-- set
--     investigator_narrative = updates_todo.investigator_narrative_old
-- from (select
--     record_id as crash_pk,
--     crashes.investigator_narrative as investigator_narrative_new,
--     record_json -> 'old' ->> 'investigator_narrative' as investigator_narrative_old
-- from
--     change_log_crashes_cris as changes
--     left join crashes on changes.record_id = crashes.id
-- where
--     record_json -> 'old' ->> 'investigator_narrative' is not null
--     and record_json -> 'new' ->> 'investigator_narrative' is null
--     and operation_type = 'UPDATE'
--     and changes.created_at > '2024-09-09'
--     and changes.created_by = 'cris'
-- order by
--     changes.id asc) as updates_todo
-- where
--     crashes_cris.id = updates_todo.crash_pk;
