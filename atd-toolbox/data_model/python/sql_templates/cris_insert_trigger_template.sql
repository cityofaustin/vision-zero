create or replace function db.$tableName$_cris_insert_rows()
returns trigger
language plpgsql
as
$$
BEGIN
    -- insert new combined / official record
    INSERT INTO db.$tableName$_unified ($affectedColumns$) values (
        $affectedColumnsWithNewPrefix$
    );
    -- insert new (editable) vz record (only record ID)
    INSERT INTO db.$tableName$_edits ($pkColumnName$) values (new.$pkColumnName$);

    RETURN NULL;
END;
$$;


create or replace trigger insert_new_$tableName$_cris
after insert on db.$tableName$_cris
for each row
execute procedure db.$tableName$_cris_insert_rows();
