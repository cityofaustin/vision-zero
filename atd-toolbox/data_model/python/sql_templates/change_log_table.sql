create table db.change_log_$tableName$ (
    id serial primary key,
    record_id integer not null references db.$tableName$ ($idColName$) on delete cascade on update cascade,
    operation_type text not null,
    record_json jsonb not null,
    created_at timestamp with time zone default now(),
    created_by text not null
);

create index on db.change_log_$tableName$ (record_id);
