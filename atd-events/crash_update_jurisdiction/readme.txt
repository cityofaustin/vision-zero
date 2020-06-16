# Using Hasura Interface as to update metadata, do the following:



# Drop current field as it is of type character varying when we want ...

ALTER TABLE atd_txdot_crashes DROP COLUMN austin_full_purpose; 



# ...  a place to store a boolean value

ALTER TABLE public.atd_txdot_crashes ADD COLUMN austin_full_purpose boolean DEFAULT False;



# As per: https://hasura.io/docs/1.0/graphql/manual/schema/custom-functions.html#example-postgis-functions
# Create and track table:

create table crash_within_austin_full_purpose (
crash_id INTEGER,
is_within_austin_full_purpose BOOLEAN
);



# Create and track function:

CREATE OR REPLACE FUNCTION find_if_crash_within_austin_full_purpose(this_crash_id integer)
RETURNS SETOF crash_within_austin_full_purpose AS $$
  select atd_txdot_crashes.crash_id, ST_Contains((select geometry from atd_jurisdictions where id = 11), atd_txdot_crashes.position) as is_within_austin_full_purpose
from atd_txdot_crashes
where 1 = 1
  and crash_id = this_crash_id
$$ LANGUAGE sql STABLE;
