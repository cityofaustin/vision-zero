alter table moped_component_crashes
    add column id bigserial unique not null;

create index on moped_component_crashes (id);
