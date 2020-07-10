-- Changes Table

create table atd_txdot_changes
(
	change_id serial not null
		constraint atd_txdot_changes_pk
			primary key,
	record_id integer not null,
	record_type varchar(32) not null,
	record_json json not null,
	update_timestamp timestamp default now(),
	created_timestamp timestamp default now(),
	updated_by varchar(128) default 'System'::character varying,
	status_id integer default 0 not null,
	affected_columns text,
	crash_date date,
	record_uqid integer not null,
	constraint atd_txdot_changes_unique
		unique (record_id, record_type, record_uqid, status_id)
);

alter table atd_txdot_changes owner to atd_vz_data;
