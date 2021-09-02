create table atd_apd_blueform
(
    form_id serial not null,
    date date not null,
    case_id integer not null
        constraint atd_apd_blueform_pk
            primary key,
    address text,
    longitude numeric,
    latitude numeric,
    hour integer,
    location_id varchar,
    est_comp_cost numeric(10,2) default '51000'::numeric,
    est_econ_cost numeric(10,2) default '12376'::numeric,
    speed_mgmt_points numeric(10,2) default 0.25
);

alter table atd_apd_blueform owner to atd_vz_data;
