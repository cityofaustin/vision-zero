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

-- backfill narratives which have been erased
WITH updates_todo AS (
    SELECT
        record_id AS crash_pk,
        crashes.investigator_narrative AS investigator_narrative_current,
        record_json -> 'old' ->> 'investigator_narrative' AS investigator_narrative_old
    FROM
        change_log_crashes_cris AS changes
    LEFT JOIN crashes ON changes.record_id = crashes.id
WHERE
    record_json -> 'old' ->> 'investigator_narrative' IS NOT NULL
    AND record_json -> 'new' ->> 'investigator_narrative' IS NULL
    AND operation_type = 'UPDATE'
    AND changes.created_at > '2024-09-01'
    AND changes.created_by = 'cris'
ORDER BY
    changes.id ASC
)
UPDATE
    crashes_cris
SET
    investigator_narrative = updates_todo.investigator_narrative_old
FROM updates_todo
WHERE
    crashes_cris.id = updates_todo.crash_pk;
