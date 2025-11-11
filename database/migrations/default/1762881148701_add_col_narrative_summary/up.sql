alter table crashes
add column narrative_summary text;

comment on column crashes.narrative_summary is 'A summary of the crash narrative that highlights key details for the FRB to review that can be added and edited by users on the fatality details page.';
