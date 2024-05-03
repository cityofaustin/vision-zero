create table db.charges_cris (
    id serial primary key,
    charge text,
    charge_cat_id integer references lookups.charge_cat_lkp (id) on update cascade on delete cascade,
    citation_nbr text,
    crash_id integer not null references db.crashes_cris (crash_id) on update cascade on delete cascade,
    person_id integer not null references db.people_cris (id) on update cascade on delete cascade,
    prsn_nbr integer not null,
    unit_nbr numeric not null
);
