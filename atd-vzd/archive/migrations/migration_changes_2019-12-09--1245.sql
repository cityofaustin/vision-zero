--
-- Creates the two tables needed for change review requests.
--

create table atd_txdot_change_status
(
	change_status_id serial not null
		constraint atd_txdot_change_status_pk
			primary key
		constraint atd_txdot_change_status_unique_id_key
			unique,
	description varchar(128) default NULL::character varying,
	description_long text,
	last_update date default now(),
	is_retired boolean default false
);

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
	status_id integer default 0 not null
);

alter table atd_txdot_changes owner to atd_vz_data;
alter table atd_txdot_change_status owner to atd_vz_data;
